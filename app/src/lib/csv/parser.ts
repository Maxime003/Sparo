import Papa from 'papaparse'
import type { ParsedCSVRow, CSVMetadata, ParsedCSVResult } from '@/types/csv'

/**
 * Parse un fichier CSV Crédit Agricole
 */
export async function parseCreditAgricoleCSV(
  file: File
): Promise<ParsedCSVResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      delimiter: ';',
      header: false,
      skipEmptyLines: false,
      encoding: 'UTF-8',
      complete: (results: { data: string[][] }) => {
        try {
          const lines = results.data

          // Trouver la ligne d'en-tête des colonnes
          const headerIndex = findHeaderIndex(lines)
          if (headerIndex === -1) {
            throw new Error('En-tête des colonnes introuvable')
          }

          // Extraire les métadonnées depuis toutes les lignes avant l'en-tête
          const metadata = extractMetadata(lines.slice(0, headerIndex))

          // Parser les transactions (après l'en-tête) en utilisant l'en-tête pour Débit/Crédit
          const headerRow = lines[headerIndex]
          const transactions = parseTransactions(
            lines.slice(headerIndex + 1),
            headerRow
          )

          resolve({ metadata, transactions })
        } catch (error) {
          reject(error)
        }
      },
      error: (error: Error) => reject(error),
    })
  })
}

/**
 * Extrait les métadonnées depuis l'en-tête du CSV
 */
function extractMetadata(headerLines: string[][]): CSVMetadata {
  const text = headerLines.map((line) => line.join(' ')).join('\n')

  // Date de téléchargement
  const downloadDateMatch = text.match(/Téléchargement du (\d{2}\/\d{2}\/\d{4})/)
  const downloadDate = downloadDateMatch
    ? parseFrenchDate(downloadDateMatch[1])
    : new Date().toISOString().split('T')[0]

  // Nom du titulaire
  const accountHolderMatch = text.match(
    /(MONSIEUR|MADAME|MADEMOISELLE)\s+([A-Z\s]+)/
  )
  const accountHolder = accountHolderMatch ? accountHolderMatch[2].trim() : ''

  // Numéro de compte
  const accountNumberMatch = text.match(/n°\s*(\d+)/)
  const accountNumber = accountNumberMatch ? accountNumberMatch[1] : ''

  // Nom du compte
  const accountNameMatch = text.match(/Compte de ([^n]+)n°/)
  const accountName = accountNameMatch
    ? accountNameMatch[1].trim()
    : 'Compte de Dépôt'

  // Solde : extraire la date et la valeur numérique
  let balance = 0
  let balanceDate = downloadDate
  const balanceDatePattern = /Solde au (\d{2}\/\d{2}\/\d{4})\s*:?\s*([\d\s,]+)\s*(?:€|EUR)?/
  const balanceDateMatch = text.match(balanceDatePattern)
  if (balanceDateMatch) {
    balanceDate = parseFrenchDate(balanceDateMatch[1])
    balance = parseFrenchNumber(balanceDateMatch[2])
  } else {
    const fallbackMatch = text.match(/Solde[^0-9]*([\d\s,]+)\s*(?:€|EUR)?/)
    if (fallbackMatch && fallbackMatch[1]) {
      balance = parseFrenchNumber(fallbackMatch[1])
    }
  }

  // Période : formats \"entre le X et le Y\" ou \"au X\"
  let periodStart = ''
  let periodEnd = ''
  const periodMatch =
    text.match(/entre le (\d{2}\/\d{2}\/\d{4}) et le (\d{2}\/\d{2}\/\d{4})/) ||
    text.match(/entre le (\d{2}\/\d{2}\/\d{4}) et (\d{2}\/\d{2}\/\d{4})/)
  if (periodMatch) {
    periodStart = parseFrenchDate(periodMatch[1])
    periodEnd = parseFrenchDate(periodMatch[2])
  } else {
    const singleDateMatch = text.match(/au (\d{2}\/\d{2}\/\d{4})/)
    if (singleDateMatch) {
      const d = parseFrenchDate(singleDateMatch[1])
      periodStart = d
      periodEnd = d
    }
  }

  const metadata = {
    downloadDate,
    accountName,
    accountNumber,
    balance,
    balanceDate,
    periodStart,
    periodEnd,
    accountHolder,
  }
  return metadata
}

/** Retire BOM, \\r et espaces */
function normalizeCell(cell: string | undefined): string {
  if (cell == null) return ''
  return cell.replace(/^\uFEFF/, '').replace(/\r/g, '').trim()
}

/**
 * Indique si la cellule ressemble au libellé (Libellé / Libelle / encodage altéré)
 */
function looksLikeLibelleColumn(cell: string): boolean {
  const c = normalizeCell(cell).toLowerCase()
  return c.includes('libell') // couvre libellé, libelle, libellÃ©, etc.
}

/**
 * Trouve l'index de la ligne d'en-tête des colonnes.
 * Accepte "Date" + "Libellé" (ou variantes), BOM et \\r nettoyés.
 */
function findHeaderIndex(lines: string[][]): number {
  return lines.findIndex((line) => {
    const col0 = normalizeCell(line[0]).toLowerCase()
    const col1 = line[1] != null ? normalizeCell(line[1]) : ''
    // En-tête classique : première colonne "Date", deuxième "Libellé"
    if (col0.includes('date') && looksLikeLibelleColumn(col1)) return true
    // Une seule cellule type "Date;Libellé;Débit euros;..."
    if (col0.includes('date') && looksLikeLibelleColumn(line[0] ?? '')) return true
    return false
  })
}

/**
 * Détecte les indices des colonnes Débit et Crédit depuis la ligne d'en-tête.
 * Retourne { debitIndex: 2, creditIndex: 3 } par défaut (ordre CA classique).
 * Certains exports ont "Crédit" en 2 et "Débit" en 3.
 */
function getDebitCreditIndices(headerRow: string[]): {
  debitIndex: number
  creditIndex: number
} {
  const defaultDebit = 2
  const defaultCredit = 3
  if (!headerRow || headerRow.length < 4) {
    return { debitIndex: defaultDebit, creditIndex: defaultCredit }
  }
  const col2 = normalizeCell(headerRow[2]).toLowerCase()
  const col3 = normalizeCell(headerRow[3]).toLowerCase()
  const col2IsCredit =
    col2.includes('crédit') || col2.includes('credit')
  const col3IsDebit =
    col3.includes('débit') || col3.includes('debit')
  if (col2IsCredit && col3IsDebit) {
    return { debitIndex: 3, creditIndex: 2 }
  }
  return { debitIndex: defaultDebit, creditIndex: defaultCredit }
}

/**
 * Parse les lignes de transactions
 */
function parseTransactions(
  lines: string[][],
  headerRow?: string[]
): ParsedCSVRow[] {
  const { debitIndex, creditIndex } = headerRow
    ? getDebitCreditIndices(headerRow)
    : { debitIndex: 2, creditIndex: 3 }

  return lines
    .filter(
      (line) =>
        line.length > Math.max(debitIndex, creditIndex) &&
        line[0]?.match(/\d{2}\/\d{2}\/\d{4}/)
    )
    .map((line) => {
      const date = parseFrenchDate(line[0])
      const label = cleanLabel(line[1])
      const debitVal = line[debitIndex] ? parseFrenchNumber(line[debitIndex]) : undefined
      const creditVal = line[creditIndex] ? parseFrenchNumber(line[creditIndex]) : undefined
      const debit = debitVal !== undefined && debitVal !== 0 ? debitVal : undefined
      const credit = creditVal !== undefined && creditVal !== 0 ? creditVal : undefined

      return {
        date,
        label,
        debit,
        credit,
      }
    })
    .filter(
      (tx) => tx.date && (tx.debit !== undefined || tx.credit !== undefined)
    )
}

/**
 * Nettoie un libellé multi-lignes
 */
function cleanLabel(label: string): string {
  if (!label) return ''

  // Retirer les guillemets
  let cleaned = label.replace(/^"|"$/g, '')

  // Remplacer les multiples espaces/newlines par un seul espace
  cleaned = cleaned.replace(/\s+/g, ' ').trim()

  return cleaned
}

/**
 * Parse une date française (DD/MM/YYYY) en ISO (YYYY-MM-DD)
 */
function parseFrenchDate(dateStr: string): string {
  const match = dateStr.match(/(\d{2})\/(\d{2})\/(\d{4})/)
  if (!match) return ''

  const [, day, month, year] = match
  return `${year}-${month}-${day}`
}

/**
 * Parse un nombre français (espace = séparateur de milliers, virgule = décimales).
 * Sans nettoyage, parseFloat("1 268") renverrait 1 (il s'arrête au premier espace).
 */
function parseFrenchNumber(numStr: string): number {
  if (!numStr) return 0

  // Retirer tout type d'espace (y compris insécable U+00A0, narrow U+202F) puis virgule → point
  const withoutSpaces = numStr.replace(/[\s\u00A0\u202F\u2009]/g, '')
  const cleaned = withoutSpaces.replace(',', '.')
  return parseFloat(cleaned) || 0
}

/**
 * Extrait le type d'opération depuis le libellé
 */
export function extractOperationType(label: string): string | undefined {
  const upperLabel = label.toUpperCase()

  if (upperLabel.includes('PAIEMENT PAR CARTE')) return 'PAIEMENT PAR CARTE'
  if (upperLabel.includes('VIREMENT EMIS')) return 'VIREMENT EMIS'
  if (upperLabel.includes('VIREMENT EN VOTRE FAVEUR'))
    return 'VIREMENT EN VOTRE FAVEUR'
  if (upperLabel.includes('PRELEVEMENT')) return 'PRELEVEMENT'
  if (upperLabel.includes('COTISATION')) return 'COTISATION'
  if (upperLabel.includes('REMISE CHEQUE')) return 'REMISE CHEQUE'

  return undefined
}
