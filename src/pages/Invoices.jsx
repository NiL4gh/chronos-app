import { useState, useRef, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus, Download, Send, PenLine, AlertTriangle, FileText, CheckCircle2, Trash2,
} from 'lucide-react';
import { invoices, projects } from '../data/mockData';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Toggle from '../components/ui/Toggle';
import EmptyState from '../components/ui/EmptyState';
import SlideOutDrawer from '../components/ui/SlideOutDrawer';
import Input, { Select } from '../components/ui/Input';
import ProofOfWorkTab from '../components/invoices/ProofOfWorkTab';
import { Table, TableHead, Th, TableBody, Tr, Td } from '../components/ui/Table';
import DateTimePicker from '../components/ui/DateTimePicker';

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
  if (status === 'paid') {
    return <Badge variant="success">Paid</Badge>;
  }
  if (status === 'overdue') {
    return <Badge variant="danger">Overdue</Badge>;
  }
  if (status === 'pending') {
    return <Badge variant="warning">Pending Signature</Badge>;
  }
  return <Badge variant="neutral">Draft</Badge>;
}

// ─── Signature Pad Component ──────────────────────────────
function SignaturePad({ onSave }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastXRef = useRef(0);
  const lastYRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Setup high DPI canvas scaling
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#171717'; // default neutral-900 / var(--text-primary) equivalent color
  }, []);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const startDrawing = (e) => {
    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    lastXRef.current = x;
    lastYRef.current = y;
  };

  const draw = (e) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (e.cancelable) e.preventDefault();
    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(lastXRef.current, lastYRef.current);
    ctx.lineTo(x, y);
    ctx.stroke();
    lastXRef.current = x;
    lastYRef.current = y;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  return (
    <div className="space-y-3">
      <div className="relative rounded-lg border-2 border-dashed border-[var(--border-strong)] bg-[var(--bg-sunken)] h-28 overflow-hidden">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
        />
        <div className="absolute top-2 right-2 flex gap-1.5 z-10 pointer-events-auto">
          <Button variant="ghost" size="sm" onClick={clearCanvas} className="bg-[var(--bg-surface)] hover:bg-[var(--bg-sunken)] px-2 py-1 text-[10px] h-auto min-h-0">
            Clear
          </Button>
          <Button variant="secondary" size="sm" onClick={() => {
            const canvas = canvasRef.current;
            if (canvas) {
              onSave?.(canvas.toDataURL());
            }
          }} className="bg-[var(--bg-surface)] hover:bg-[var(--bg-sunken)] px-2 py-1 text-[10px] h-auto min-h-0">
            Accept
          </Button>
        </div>
        <p className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-[var(--text-muted)] pointer-events-none select-none">
          Draw signature here
        </p>
      </div>
    </div>
  );
}

// ─── Invoice Detail (right panel) ─────────────────────────
function InvoiceDetail({ invoice, sigEnabled, onSigToggle, signature, onSaveSignature }) {
  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumb Header */}
      <div className="px-6 py-2.5 flex items-center gap-2 border-b border-[var(--border-default)] shrink-0 bg-[var(--bg-surface)]">
        <span className="text-xs font-medium text-[var(--text-muted)]">Invoices</span>
        <span className="text-[var(--text-disabled)] text-xs">/</span>
        <span className="text-xs font-medium text-[var(--text-secondary)]">{invoice.invoiceNumber}</span>
      </div>

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
                {signature ? (
                  <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-sunken)] p-4 flex flex-col items-center justify-center gap-2 relative">
                    <img src={signature} alt="Client Signature" className="max-h-20 object-contain mix-blend-multiply dark:invert" />
                    <p className="text-xs text-[var(--text-muted)]">Signed Electronically</p>
                    <button
                      onClick={() => onSaveSignature(null)}
                      className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <SignaturePad onSave={onSaveSignature} />
                )}

                {!signature && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--warning-bg)] border border-[var(--warning-border)] animate-fade-in">
                    <AlertTriangle size={13} className="text-[var(--warning-text)] shrink-0" />
                    <p className="text-xs text-[var(--warning-text)]">
                      Invoice will not be processed until signature is received.
                    </p>
                  </div>
                )}
                
                {signature && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--success-bg)] border border-[var(--success-border)] animate-fade-in">
                    <CheckCircle2 size={13} className="text-[var(--success-text)] shrink-0" />
                    <p className="text-xs text-[var(--success-text)]">
                      Signature verified. Ready for sending/processing.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="primary" size="sm" disabled={!signature}>
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
  const { invoiceList, setInvoiceList } = useOutletContext();
  const [activeTab, setActiveTab]         = useState('all');
  const [selectedId, setSelectedId]       = useState(invoiceList[0]?.id ?? null);
  const [createOpen, setCreateOpen]       = useState(false);
  const [newInvoice, setNewInvoice]       = useState({
    clientName: '',
    clientEmail: '',
    projectId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      return d.toISOString().slice(0, 10);
    })(),
    notes: '',
    lineItems: [
      { description: 'Development services', hours: 40, rate: 95 },
    ],
  });
  const [sigStates, setSigStates]         = useState(
    Object.fromEntries(invoiceList.map((inv) => [inv.id, inv.requiresSignature]))
  );
  const [signatures, setSignatures] = useState({});

  const statusFilter  = TAB_STATUS[activeTab];
  const filtered      = statusFilter === null
    ? invoiceList
    : invoiceList.filter((inv) => inv.status === statusFilter);

  // Keep selection valid when tab changes
  const selectedInvoice = filtered.find((inv) => inv.id === selectedId) ?? null;

  const addLineItem = () => setNewInvoice(prev => ({
    ...prev,
    lineItems: [...prev.lineItems, { description: '', hours: 1, rate: 95 }],
  }));

  const removeLineItem = (idx) => setNewInvoice(prev => ({
    ...prev,
    lineItems: prev.lineItems.filter((_, i) => i !== idx),
  }));

  const updateLineItem = (idx, field, value) => setNewInvoice(prev => ({
    ...prev,
    lineItems: prev.lineItems.map((item, i) =>
      i === idx ? { ...item, [field]: field === 'description' ? value : Number(value) } : item
    ),
  }));

  const lineItemTotals = newInvoice.lineItems.map(item => item.hours * item.rate);
  const newSubtotal = lineItemTotals.reduce((a, b) => a + b, 0);
  const newTax = Math.round(newSubtotal * 0.1);
  const newTotal = newSubtotal + newTax;

  const handleCreateInvoice = () => {
    const selectedProj = projects.find(p => p.id === newInvoice.projectId);
    const lineItems = newInvoice.lineItems
      .filter(i => i.description.trim())
      .map(i => ({ description: i.description, hours: i.hours, rate: i.rate, total: i.hours * i.rate }));
    if (lineItems.length === 0) {
      lineItems.push({ description: 'General services', hours: 1, rate: 95, total: 95 });
    }
    const subtotal = lineItems.reduce((a, i) => a + i.total, 0);
    const tax = Math.round(subtotal * 0.1);
    const newInv = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      client: {
        name: newInvoice.clientName || 'Unknown Client',
        email: newInvoice.clientEmail || 'client@company.com',
        address: '123 Client St, Tech City',
      },
      projectName: selectedProj ? selectedProj.name : 'General Work',
      projectId: newInvoice.projectId,
      issueDate: newInvoice.issueDate,
      dueDate: newInvoice.dueDate,
      status: 'draft',
      lineItems,
      subtotal,
      tax,
      total: subtotal + tax,
      notes: newInvoice.notes,
      requiresSignature: false,
    };
    setInvoiceList(prev => [...prev, newInv]);
    setCreateOpen(false);
    setNewInvoice({
      clientName: '',
      clientEmail: '',
      projectId: '',
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return d.toISOString().slice(0, 10);
      })(),
      notes: '',
      lineItems: [{ description: 'Development services', hours: 40, rate: 95 }],
    });
    setSelectedId(newInv.id);
  };

  return (
    <div
      className="animate-fade-in flex -mx-8 -my-6 overflow-hidden h-full"
      style={{ background: 'transparent' }}
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
            signature={signatures[selectedInvoice.id] ?? null}
            onSaveSignature={(val) =>
              setSignatures((s) => ({ ...s, [selectedInvoice.id]: val }))
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
            <Button variant="primary" onClick={handleCreateInvoice}>Create Invoice</Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Client Name</label>
            <Input
              placeholder="Client or company name"
              value={newInvoice.clientName}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Client Email</label>
            <Input
              type="email"
              placeholder="client@company.com"
              value={newInvoice.clientEmail}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Project</label>
            <Select
              value={newInvoice.projectId}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, projectId: e.target.value }))}
            >
              <option value="">Select a project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Issue Date</label>
              <DateTimePicker
                value={newInvoice.issueDate}
                onChange={(val) => setNewInvoice(prev => ({ ...prev, issueDate: val }))}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5">Due Date</label>
              <DateTimePicker
                value={newInvoice.dueDate}
                onChange={(val) => setNewInvoice(prev => ({ ...prev, dueDate: val }))}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1.5">Notes</label>
            <Input
              placeholder="Payment terms, special instructions..."
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Line Items</label>
              <button
                onClick={addLineItem}
                className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium transition-colors"
              >
                <Plus size={11} /> Add Item
              </button>
            </div>
            <div className="space-y-2">
              {newInvoice.lineItems.map((item, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_60px_60px_28px] gap-1.5 items-center">
                  <Input
                    placeholder="Description"
                    value={item.description}
                    onChange={e => updateLineItem(idx, 'description', e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="number"
                    placeholder="Hrs"
                    value={item.hours}
                    onChange={e => updateLineItem(idx, 'hours', e.target.value)}
                    className="text-xs text-center"
                  />
                  <Input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={e => updateLineItem(idx, 'rate', e.target.value)}
                    className="text-xs text-center"
                  />
                  <button
                    onClick={() => removeLineItem(idx)}
                    className="w-6 h-6 flex items-center justify-center text-[var(--text-disabled)] hover:text-red-500 transition-colors"
                    disabled={newInvoice.lineItems.length === 1}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <div className="text-xs text-[var(--text-muted)] space-y-1 text-right">
                <div>Subtotal: <span className="font-mono font-semibold text-[var(--text-primary)]">${newSubtotal.toLocaleString()}</span></div>
                <div>Tax (10%): <span className="font-mono text-[var(--text-secondary)]">${newTax.toLocaleString()}</span></div>
                <div className="font-bold text-[var(--text-primary)]">Total: <span className="font-mono text-amber-600">${newTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </SlideOutDrawer>
    </div>
  );
}
