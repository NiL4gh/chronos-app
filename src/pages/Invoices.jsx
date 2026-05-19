import { useState } from 'react';
import {
  Plus, Download, Send, PenLine, AlertTriangle, FileText,
} from 'lucide-react';
import { invoices } from '../data/mockData';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import EmptyState from '../components/ui/EmptyState';
import SlideOutDrawer from '../components/ui/SlideOutDrawer';
import Input, { Select } from '../components/ui/Input';
import ProofOfWorkTab from '../components/invoices/ProofOfWorkTab';
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table';

// ─── Tab config ───────────────────────────────────────────
const TABS = [
  { id: 'all',                label: 'All'               },
  { id: 'draft',              label: 'Draft'             },
  { id: 'pending_signature',  label: 'Pending Signature' },
  { id: 'paid',               label: 'Paid'              },
  { id: 'overdue',            label: 'Overdue'           },
];

// Tab id → invoice.status value (null means show all)
const TAB_STATUS = {
  all:               null,
  draft:             'draft',
  pending_signature: 'pending',
  paid:              'paid',
  overdue:           'overdue',
};

// ─── Helpers ──────────────────────────────────────────────
function StatusBadge({ status }) {
  if (status === 'paid')    return <Badge variant="success">Paid</Badge>;
  if (status === 'overdue') return <Badge variant="danger">Overdue</Badge>;
  if (status === 'pending') return <Badge variant="warning">Pending Signature</Badge>;
  return <Badge variant="neutral">Draft</Badge>;
}

// ─── Invoice Detail (right panel) ─────────────────────────
function InvoiceDetail({ invoice, sigEnabled, onSigToggle }) {
  return (
    <div className="flex flex-col h-full">
      {/* Detail toolbar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-[var(--border-default)] bg-[var(--bg-surface)] sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-px h-6 bg-amber-500/50 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-sm font-mono text-[var(--text-secondary)]">{invoice.invoiceNumber}</p>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{invoice.client.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <Download size={14} />Download PDF
          </Button>
          <Button variant="primary" size="sm">
            <Send size={14} />Send Invoice
          </Button>
        </div>
      </div>

      {/* Scrollable detail body */}
      <div className="flex-1 overflow-y-auto bg-[var(--bg-base)]">
        <div className="mx-6 my-4 p-8 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-xl shadow-[var(--shadow-sm)] space-y-6">

          {/* Header row */}
          <div className="flex justify-between items-start p-4 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)]">
            <div className="space-y-1">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-semibold">Invoice Details</p>
              <p className="text-sm text-[var(--text-secondary)]">Issued: <span className="font-mono text-[var(--text-primary)]">{invoice.issueDate}</span></p>
              <p className="text-sm text-[var(--text-secondary)]">Due: <span className="font-mono text-[var(--text-primary)]">{invoice.dueDate}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--text-muted)] mb-1">Total Amount</p>
              <p className="text-2xl font-semibold font-mono text-[var(--text-primary)]">${invoice.total.toLocaleString()}</p>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="grid grid-cols-2 gap-6 p-5 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                From
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">Chronos Workspace</p>
              <p className="text-xs text-[var(--text-muted)]">workspace@chronos.app</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-2">
                Bill To
              </p>
              <p className="text-sm font-medium text-[var(--text-primary)]">{invoice.client.name}</p>
              <p className="text-xs text-[var(--text-muted)]">{invoice.client.email}</p>
              <p className="text-xs text-[var(--text-muted)]">{invoice.client.address}</p>
            </div>
          </div>

          {/* Line items table */}
          <Table>
            <TableHead>
              <Th className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Description</Th>
              <Th className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Hours</Th>
              <Th className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Rate</Th>
              <Th className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-right">Total</Th>
            </TableHead>
            <TableBody>
              {invoice.lineItems.map((item, i) => (
                <Tr key={i}>
                  <Td><span className="text-sm text-[var(--text-secondary)]">{item.description}</span></Td>
                  <Td className="text-right"><span className="text-sm font-mono text-[var(--text-secondary)]">{item.hours}h</span></Td>
                  <Td className="text-right"><span className="text-sm font-mono text-[var(--text-secondary)]">${item.rate}</span></Td>
                  <Td className="text-right"><span className="text-sm font-mono font-medium text-[var(--text-primary)]">${item.total.toLocaleString()}</span></Td>
                </Tr>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2 p-4 bg-[var(--bg-sunken)] border-t border-[var(--border-strong)] rounded-lg">
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>Subtotal</span>
                <span className="font-mono">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-[var(--text-muted)]">
                <span>Tax</span>
                <span className="font-mono">${invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-[var(--text-primary)] pt-2 border-t border-[var(--border-default)]">
                <span>Total</span>
                <span className="font-mono text-xl font-bold text-[var(--text-primary)]">${invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-4 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)]">
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                Notes
              </p>
              <p className="text-sm text-[var(--text-tertiary)] italic">{invoice.notes}</p>
            </div>
          )}

          {/* Digital Signature */}
          <div className="space-y-4 pt-4 border-t border-[var(--border-default)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[var(--text-primary)]">Digital Signature</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Require client signature before processing
                </p>
              </div>
              <Toggle checked={sigEnabled} onChange={onSigToggle} size="sm" />
            </div>

            {sigEnabled && (
              <div className="space-y-3">
                <div className="rounded-lg border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-sunken)] h-28 flex flex-col items-center justify-center gap-2">
                  <PenLine size={18} className="text-[var(--text-muted)]" />
                  <p className="text-sm text-[var(--text-muted)]">Sign here</p>
                  <p className="text-xs text-[var(--text-disabled)]">
                    Awaiting client signature via secure link
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--warning-bg)] border border-[var(--warning-border)]">
                  <AlertTriangle size={13} className="text-[var(--warning-text)] shrink-0" />
                  <p className="text-xs text-[var(--warning-text)]">
                    Invoice will not be processed until signature is received.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="primary" size="sm">
                    <Send size={13} />Send for Signature
                  </Button>
                  <Button variant="secondary" size="sm">
                    Copy Link
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Proof of Work */}
          <div className="border-t border-[var(--border-default)] pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--text-muted)] mb-4">
              Proof of Work
            </p>
            <ProofOfWorkTab />
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────
export default function Invoices() {
  const [activeTab, setActiveTab]         = useState('all');
  const [selectedId, setSelectedId]       = useState(invoices[0]?.id ?? null);
  const [createOpen, setCreateOpen]       = useState(false);
  const [sigStates, setSigStates]         = useState(
    Object.fromEntries(invoices.map((inv) => [inv.id, inv.requiresSignature]))
  );

  const statusFilter  = TAB_STATUS[activeTab];
  const filtered      = statusFilter === null
    ? invoices
    : invoices.filter((inv) => inv.status === statusFilter);

  // Keep selection valid when tab changes
  const selectedInvoice = filtered.find((inv) => inv.id === selectedId) ?? null;

  return (
    <div
      className="animate-fade-in flex -mx-8 -my-6 overflow-hidden h-full"
      style={{ background: 'var(--bg-base)' }}
    >
      {/* ── Left Panel ── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-[var(--border-default)] bg-[var(--bg-surface)] overflow-y-auto">

        {/* List header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border-default)] shrink-0">
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">Invoices</h2>
          <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
            <Plus size={13} />New
          </Button>
        </div>

        {/* Status pipeline tabs */}
        <div className="border-b border-[var(--border-default)] px-3 py-2 flex gap-1 shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedId(null);
              }}
              className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 border ${
                activeTab === tab.id
                  ? 'bg-[var(--accent-subtle)] text-[var(--accent-text)] border-[var(--accent-border)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-sunken)] border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Invoice list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <EmptyState
              icon={FileText}
              title="No invoices"
              description="No invoices match this status filter."
            />
          ) : (
            filtered.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setSelectedId(inv.id)}
                className={`w-full text-left px-4 py-3.5 border-b border-[var(--border-default)] transition-colors duration-100 border-l-2 ${
                  selectedId === inv.id
                    ? 'bg-[var(--accent-subtle)] border-l-[var(--accent)]'
                    : 'border-l-transparent hover:bg-[var(--bg-sunken)]'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{inv.client.name}</p>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-[var(--text-muted)]">{inv.invoiceNumber}</span>
                  <span className="text-sm font-mono font-semibold text-[var(--text-primary)]">
                    ${inv.total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">Due {inv.dueDate}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 min-w-0 overflow-hidden bg-[var(--bg-base)]">
        {selectedInvoice ? (
          <InvoiceDetail
            invoice={selectedInvoice}
            sigEnabled={sigStates[selectedInvoice.id] ?? false}
            onSigToggle={(v) =>
              setSigStates((s) => ({ ...s, [selectedInvoice.id]: v }))
            }
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <EmptyState
              icon={FileText}
              title="No invoice selected"
              description="Select an invoice from the list to view its details."
            />
          </div>
        )}
      </div>

      {/* Create Invoice Drawer */}
      <SlideOutDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Invoice"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={() => setCreateOpen(false)}>Create Invoice</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Client Name</label>
            <Input placeholder="Client or company name" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Client Email</label>
            <Input type="email" placeholder="client@company.com" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Project</label>
            <Select>
              <option value="">Select a project...</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Issue Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Due Date</label>
              <Input type="date" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Notes</label>
            <Input placeholder="Payment terms, special instructions..." />
          </div>
        </div>
      </SlideOutDrawer>
    </div>
  );
}
