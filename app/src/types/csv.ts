export interface ParsedCSVRow {
  date: string // YYYY-MM-DD
  label: string
  debit?: number
  credit?: number
}

export interface CSVMetadata {
  downloadDate: string // YYYY-MM-DD
  accountName: string
  accountNumber: string
  balance: number
  balanceDate: string // YYYY-MM-DD — date from "Solde au DD/MM/YYYY"
  periodStart: string // YYYY-MM-DD
  periodEnd: string // YYYY-MM-DD
  accountHolder?: string
}

export interface ParsedCSVResult {
  metadata: CSVMetadata
  transactions: ParsedCSVRow[]
}
