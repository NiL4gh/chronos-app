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
import { Input, Select } from '../components/ui/Input';
import ProofOfWorkTab from '../components/invoices/ProofOfWorkTab';

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
      <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-px h-6 bg-violet-500/50 rounded-full" />
          <div>
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-neutral-100 font-mono">{invoice.invoiceNumber}</p>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">{invoice.client.name}</p>
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
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* Header row */}
          <div className="flex justify-between items-start p-4 rounded-lg bg-neutral-800/40 border border-neutral-800">
            <div className="space-y-1">
              <p className="text-xs text-neutral-600 uppercase tracking-widest font-semibold">Invoice Details</p>
              <p className="text-sm text-neutral-300">Issued: <span className="font-mono text-neutral-200">{invoice.issueDate}</span></p>
              <p className="text-sm text-neutral-300">Due: <span className="font-mono text-neutral-200">{invoice.dueDate}</span></p>
            </div>
            <div className="text-right">
              <p className="text-xs text-neutral-600 mb-1">Total Amount</p>
              <p className="text-2xl font-semibold font-mono text-neutral-100">${invoice.total.toLocaleString()}</p>
            </div>
          </div>

          {/* From / Bill To */}
          <div className="grid grid-cols-2 gap-6 p-5 rounded-xl border border-neutral-800 bg-neutral-900/50">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                From
              </p>
              <p className="text-sm font-medium text-neutral-200">Chronos Workspace</p>
              <p className="text-xs text-neutral-500">workspace@chronos.app</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-2">
                Bill To
              </p>
              <p className="text-sm font-medium text-neutral-200">{invoice.client.name}</p>
              <p className="text-xs text-neutral-500">{invoice.client.email}</p>
              <p className="text-xs text-neutral-500">{invoice.client.address}</p>
            </div>
          </div>

          {/* Line items table */}
          <div className="rounded-xl border border-neutral-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Hours
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/50 bg-neutral-900">
                {invoice.lineItems.map((item, i) => (
                  <tr key={i} className="hover:bg-neutral-800/40 transition-colors duration-100">
                    <td className="px-4 py-3 text-sm text-neutral-300">{item.description}</td>
                    <td className="px-4 py-3 text-sm font-mono text-neutral-300 text-right">
                      {item.hours}h
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-neutral-300 text-right">
                      ${item.rate}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono font-medium text-neutral-200 text-right">
                      ${item.total.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Subtotal</span>
                <span className="font-mono">${invoice.subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Tax</span>
                <span className="font-mono">${invoice.tax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-neutral-100 pt-2 border-t border-neutral-800">
                <span>Total</span>
                <span className="font-mono">${invoice.total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="p-4 rounded-lg bg-neutral-900/50 border border-neutral-800">
              <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-1.5">
                Notes
              </p>
              <p className="text-sm text-neutral-400">{invoice.notes}</p>
            </div>
          )}

          {/* Digital Signature */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-300">Digital Signature</p>
                <p className="text-xs text-neutral-600 mt-0.5">
                  Require client signature before processing
                </p>
              </div>
              <Toggle checked={sigEnabled} onChange={onSigToggle} size="sm" />
            </div>

            {sigEnabled && (
              <div className="space-y-3">
                <div className="rounded-lg border-2 border-dashed border-neutral-600 bg-neutral-900/50 h-28 flex flex-col items-center justify-center gap-2">
                  <PenLine size={18} className="text-neutral-600" />
                  <p className="text-sm text-neutral-500">Sign here</p>
                  <p className="text-xs text-neutral-700">
                    Awaiting client signature via secure link
                  </p>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                  <p className="text-xs text-amber-400">
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

          {/* Proof of Work (Phase 1 placeholder) */}
          <div className="border-t border-neutral-800 pt-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-500 mb-4">
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
      className="animate-fade-in flex -mx-8 -my-6 overflow-hidden"
      style={{ height: 'calc(100vh - 56px)' }}
    >
      {/* ── Left Panel ── */}
      <div className="w-72 shrink-0 flex flex-col border-r border-neutral-800 bg-neutral-900">

        {/* List header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-800 shrink-0">
          <h2 className="text-sm font-semibold text-neutral-200">Invoices</h2>
          <button
            onClick={() => setCreateOpen(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-transparent transition-colors duration-150"
          >
            <Plus size={13} />New
          </button>
        </div>

        {/* Status pipeline tabs */}
        <div className="flex gap-1 px-3 py-2 border-b border-neutral-800 shrink-0 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedId(null);
              }}
              className={`shrink-0 px-2.5 py-1 rounded-md text-xs font-medium transition-colors duration-150 border ${
                activeTab === tab.id
                  ? 'bg-violet-500/10 text-violet-400 border-violet-500/20'
                  : 'text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800 border-transparent'
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
                className={`w-full text-left px-4 py-3.5 border-b border-neutral-800/50 transition-colors duration-100 border-l-2 ${
                  selectedId === inv.id
                    ? 'bg-violet-500/5 border-l-violet-500'
                    : 'border-l-transparent hover:bg-neutral-800/40'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-neutral-200 truncate">{inv.client.name}</p>
                  <StatusBadge status={inv.status} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono text-neutral-500">{inv.invoiceNumber}</span>
                  <span className="text-sm font-mono font-semibold text-neutral-100">
                    ${inv.total.toLocaleString()}
                  </span>
                </div>
                <p className="text-xs text-neutral-600 mt-1">Due {inv.dueDate}</p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 min-w-0 overflow-hidden bg-neutral-950">
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
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Client Name</label>
          <Input placeholder="Client or company name" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Client Email</label>
          <Input type="email" placeholder="client@company.com" />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Project</label>
          <Select>
            <option value="">Select a project...</option>
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Issue Date</label>
            <Input type="date" />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1.5">Due Date</label>
            <Input type="date" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-400 mb-1.5">Notes</label>
          <Input placeholder="Payment terms, special instructions..." />
        </div>
      </SlideOutDrawer>
    </div>
  );
}
