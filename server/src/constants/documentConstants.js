const categoryData = {
    'Disbursement Vouchers/ Payrolls w/ supporting documents': [
      'Disbursement vouchers',
      'Payroll slips',
      'Invoices for services rendered',
      'Purchase orders (POs)',
      'Vendor contracts or agreements',
      'Receipts for reimbursable expenses',
    ],
    'Official Receipts and Supporting Documents': [
      'Official receipts (ORs) from vendors or clients',
      'Acknowledgment receipts',
      'Payment confirmations or transaction receipts',
    ],
    'Liquidation of Cash Advance and Supporting Documents': [
        'Liquidation reports for advances',
        'Receipts for cash advance spending',
        'Hotel or travel expense invoices',
        'Petty cash replenishment documents',
      ],
      'BIR FORMS - 2307 - Withholding tax certs': [
        'BIR Form 2307 - Certificate of Withholding Tax',
        'BIR Form 2316 - Certificate of Compensation Payment/Tax Withheld',
        'Other tax forms required for compliance',
      ],
      'General Ledger': [
        'Ledger reports summarizing income and expenses',
        'Monthly financial summaries',
      ],
      'Subsidary Ledger': [
        'Records for accounts receivable',
        'Records for accounts payable',
        'Detailed ledger breakdowns for specific customers, vendors, or accounts',
      ],
      'Financial Statements': [
        'Balance Sheets',
        'Income Statements',
        'Cash Flow Statements',
        'Statement of Changes in Equity',
      ],
      'Trial Balance': ['Trial balance summary for a specific accounting period'],
      'Certifications': [
        'Tax clearance certificates',
        'Employment or income certifications',
        'Compliance certificates (e.g., BIR clearance)',
      ],
      'Special orders/ Memorandums': [
        'Internal memorandums',
        'Special orders for financial or operational tasks',
      ],
      'Budget Utilization Slips': [
        'Budget slips for allocated funds',
        'Expense allocation sheets',
        'Approval slips for fund utilization',
      ],
      'Fund Utilization Reports and Supporting Documents': [
        'Reports on fund usage',
        'Receipts related to fund spending',
        'Expense breakdowns',
      ],
      'Liquidation Reports and Supporting Documents': [
        'Detailed liquidation reports for funds used',
        'Invoices and receipts supporting liquidation claims',
        'Expense justifications',
      ],
      'Memorandum of Agreement and Supporting Documents': [
        'Signed Memorandum of Agreement (MOA)',
        'Supporting documents like correspondence or annexes',
      ],
      'Journals , Journal Entry Vouchers': [
        'Daily journal entries',
        'Journal entry vouchers for corrections or adjustments',
        'Manual journal entries',
      ],
      'Free higher education billing and supporting documents': [
        'Higher education billing statements',
        'Supporting documentation for grants or scholarships',
      ],
      'Billing statements and supporting docs': [
        'Utility bills (e.g., electricity, water, internet)',
        'Service billing invoices',
        'Payment schedules for clients',
        'Credit card statements',
      ],

  };
  

  const categories = Object.keys(categoryData);
  

  const documentTypes = Object.values(categoryData).flat();
  
  module.exports = {
    categoryData,
    categories,
    documentTypes
  };