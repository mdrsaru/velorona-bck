export const taskAssignmentTable = {
  user_id: 'user_id',
  task_id: 'task_id',
};

export const userRolesTable = {
  user_id: 'user_id',
  role_id: 'role_id',
};

export const timeEntry = {
  project_id: 'project_id',
  approver_id: 'approver_id',
  company_id: 'company_id',
  created_by: 'created_by',
  task_id: 'task_id',
};

export const timesheet = {
  week_start_date: 'week-start_date',
  week_end_date: 'week-end_date',
  total_hours: 'total_hours',
  total_expense: 'total_expense',
  company_id: 'company_id',
  user_id: 'user_id',
  client_id: 'client_id',
  approver_id: 'approver_id',
};

export const usersClients = {
  user_id: 'user_id',
  client_id: 'client_id',
};

export const invoices = {
  verified: 'verified',
  sent_as_email: 'sent_as_email',
  status: 'status',
  date: 'date',
  payment_due: 'payment_due',
  po_number: 'po_number',
  total_amount: 'total_amount',
  tax_percent: 'tax_percent',
  notes: 'notes',
  company_id: 'company_id',
  client_id: 'client_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

export const invoiceItems = {
  invoice_id: 'invoice_id',
  project_id: 'project_id',
  hours: 'hours',
  rate: 'rate',
  amount: 'amount',
};
