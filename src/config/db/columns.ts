export const company = {
  name: 'name',
  status: 'status',
  archived: 'archived',
  company_code: 'company_code',
  admin_email: 'admin_email',
};

export const taskAssignmentTable = {
  user_id: 'user_id',
  task_id: 'task_id',
};

export const userProjectTable = {
  user_id: 'user_id',
  project_id: 'project_id',
};

export const userRolesTable = {
  user_id: 'user_id',
  role_id: 'role_id',
};

export const taskAttachmentTable = {
  media_id: 'media_id',
  task_id: 'task_id',
};

export const timeEntry = {
  start_time: 'start_time',
  end_time: 'end_time',
  duration: 'duration',
  client_location: 'client_location',
  project_id: 'project_id',
  company_id: 'company_id',
  created_by: 'created_by',
  task_id: 'task_id',
  invoice_id: 'invoice_id',
  submitted: 'submitted',
  approval_status: 'approval_status',
  approver_id: 'approver_id',
  timesheet_id: 'timesheet_id',
  hourly_rate: 'hourly_rate',
};

export const timesheet = {
  week_start_date: 'week_start_date',
  week_end_date: 'week_end_date',
  duration: 'duration',
  total_expense: 'total_expense',
  company_id: 'company_id',
  user_id: 'user_id',
  client_id: 'client_id',
  approver_id: 'approver_id',
  last_approved_at: 'last_approved_at',
  is_submitted: 'is_submitted',
  last_submitted_at: 'last_submitted_at',
  invoiced_duration: 'invoiced_duration',
};

export const usersClients = {
  user_id: 'user_id',
  client_id: 'client_id',
};

export const invoices = {
  verified: 'verified',
  sent_as_email: 'sent_as_email',
  status: 'status',
  issue_date: 'issue_date',
  due_date: 'due_date',
  invoice_number: 'invoice_number',
  po_number: 'po_number',
  total_quantity: 'total_quantity',
  subtotal: 'subtotal',
  total_amount: 'total_amount',
  tax_percent: 'tax_percent',
  notes: 'notes',
  company_id: 'company_id',
  client_id: 'client_id',
  timesheet_id: 'timesheet_id',
  created_at: 'created_at',
  updated_at: 'updated_at',
};

export const invoiceItems = {
  invoice_id: 'invoice_id',
  project_id: 'project_id',
  quantity: 'quantity',
  rate: 'rate',
  amount: 'amount',
};

export const userPayRate = {
  start_date: 'start_date',
  end_date: 'end_date',
  amount: 'amount',
  user_id: 'user_id',
  project_id: 'project_id',
};

export const projects = {
  name: 'name',
  company_id: 'company_id',
  client_id: 'client_id',
};

export const attachedTimesheets = {
  company_id: 'company_id',
  created_by: 'created_by',
  attachment_id: 'attachment_id',
  timesheet_id: 'timesheet_id',
  invoice_id: 'invoice_id',
};

export const workschedule = {
  start_date: 'start_date',
  end_date: 'end_date',
  payroll_allocated_hours: 'payroll_allocated_hours',
  payroll_usage_hours: 'payroll_usage_hours',
  company_id: 'company_id',
};

export const workscheduleDetail = {
  time_detail: 'time_detail',
  workschedule_id: 'workschedule_id',
  user_id: 'user_id',
  start_date: 'start_date',
  end_date: 'end_date',
};

export const workscheduleTimeDetail = {
  start_time: 'start_time',
  end_time: 'end_time',
  workschedule_detail_id: 'workschedule_detail_id',
};
