import { useState, useEffect, useRef } from 'react'
import { CustomerProvider, useCustomer } from './context/CustomerContext'
import { useFrontContext } from './hooks/useFrontContext'
import Header from './components/Header'
import TabNav, { TabId, visibleTabs } from './components/TabNav'
import Overview from './components/tabs/Overview'
import OrdersRefunds from './components/tabs/OrdersRefunds'
import PaymentSchedule from './components/tabs/PaymentSchedule'
import AccountActions from './components/tabs/AccountActions'
import Merchant from './components/tabs/Merchant'
import SkeletonLoader from './components/shared/SkeletonLoader'
import Toast from './components/shared/Toast'

// ── Dev mode banner (shown when running outside Front) ────────────────────────
const DEV_CUSTOMERS = [
  { email: 'leyton@finalproduction.club', name: 'Leyton Graves', tag: 'Consumer · Active' },
  { email: 'elias@auditlawyer.club',      name: 'Elias Holly',   tag: 'Consumer · Suspended' },
  { email: 'sarah@zestymedia.club',       name: 'Sarah Murphy',  tag: 'Merchant' },
]

function DevBanner({
  selectedEmail,
  onSelect,
}: {
  selectedEmail: string | null
  onSelect: (email: string) => void
}) {
  return (
    <div className="flex-shrink-0 bg-amber-50 border-b border-amber-200 px-3 py-2.5">
      <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wide mb-2">
        ⚙ Demo Mode — Select customer
      </p>
      <div className="flex flex-col gap-1">
        {DEV_CUSTOMERS.map(c => {
          const active = selectedEmail === c.email
          return (
            <button
              key={c.email}
              onClick={() => onSelect(c.email)}
              className={`text-left px-2.5 py-1.5 rounded-lg text-[11px] transition-colors border ${
                active
                  ? 'bg-[#00B2A9] border-[#00B2A9] text-white'
                  : 'bg-white border-[#E0E0E0] text-gray-700 hover:border-[#00B2A9]'
              }`}
            >
              <span className="font-semibold">{c.name}</span>
              <span className={`ml-1.5 ${active ? 'text-white/70' : 'text-gray-400'}`}>
                {c.tag}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Empty state (no conversation selected) ────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
      <div
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
        style={{ background: '#E6F7F6' }}
      >
        <span className="text-[20px]" style={{ color: '#00B2A9' }}>◈</span>
      </div>
      <p className="text-[13px] font-medium text-gray-600">
        Select a conversation to view customer data
      </p>
      <p className="text-[11px] text-gray-400 mt-1">
        Scalapay customer info will appear here
      </p>
    </div>
  )
}

// ── No-match state ────────────────────────────────────────────────────────────
function NoMatchState({ email }: { email: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-6 text-center">
      <div
        className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center"
        style={{ background: '#F0F0F0' }}
      >
        <span className="text-[20px]">🔍</span>
      </div>
      <p className="text-[13px] font-medium text-gray-600">
        No Scalapay record found
      </p>
      <p className="text-[11px] text-gray-400 mt-1">{email}</p>
    </div>
  )
}

// ── Main plugin body (needs CustomerContext) ──────────────────────────────────
function PluginBody({
  activeEmail,
  conversationId,
  loadingCustomer,
}: {
  activeEmail: string | null
  conversationId: string | null
  loadingCustomer: boolean
}) {
  const { customer, setActiveEmail, toasts, dismissToast } = useCustomer()

  // Sync email into context
  useEffect(() => {
    setActiveEmail(activeEmail)
  }, [activeEmail, setActiveEmail])

  // Tab state keyed by conversation/email so it persists per-conversation
  const [tabMap, setTabMap] = useState<Record<string, TabId>>({})
  const tabKey = conversationId ?? activeEmail ?? '__none__'
  const activeTab: TabId = tabMap[tabKey] ?? 'overview'

  const setTab = (t: TabId) => {
    setTabMap(prev => ({ ...prev, [tabKey]: t }))
  }

  // If the active tab becomes invisible (e.g. account reactivated hides Account tab),
  // fall back to Overview automatically.
  useEffect(() => {
    if (!customer) return
    const allowed = visibleTabs(customer).map(t => t.id)
    if (!allowed.includes(activeTab)) {
      setTab('overview')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customer?.accountStatus, customer?.type, activeTab])

  const TABS: Record<TabId, React.ReactNode> = {
    overview:  <Overview />,
    orders:    <OrdersRefunds />,
    payments:  <PaymentSchedule />,
    account:   <AccountActions />,
    merchant:  <Merchant />,
  }

  return (
    <>
      {/* Header always rendered */}
      <Header customer={customer} email={activeEmail} />

      {loadingCustomer ? (
        <div className="flex-1 overflow-y-auto">
          <SkeletonLoader />
        </div>
      ) : !activeEmail ? (
        <EmptyState />
      ) : !customer ? (
        <NoMatchState email={activeEmail} />
      ) : (
        <>
          <TabNav customer={customer} activeTab={activeTab} onTabChange={setTab} />
          <div className="flex-1 overflow-y-auto">
            {TABS[activeTab]}
          </div>
        </>
      )}

      {/* Toasts */}
      <Toast toasts={toasts} onDismiss={dismissToast} />
    </>
  )
}

// ── Root component ────────────────────────────────────────────────────────────
export default function App() {
  const frontCtx = useFrontContext()
  const [devEmail, setDevEmail] = useState<string | null>(null)
  const [loadingCustomer, setLoadingCustomer] = useState(false)
  const prevEmailRef = useRef<string | null>(null)

  // Active email: Front context takes priority, then dev picker
  const activeEmail = frontCtx.contactEmail ?? devEmail

  // Show 300ms skeleton on every email change (ref avoids cleanup race)
  useEffect(() => {
    if (activeEmail !== prevEmailRef.current) {
      prevEmailRef.current = activeEmail
      if (activeEmail) {
        setLoadingCustomer(true)
        const t = setTimeout(() => setLoadingCustomer(false), 300)
        return () => clearTimeout(t)
      }
    }
  }, [activeEmail])

  return (
    <CustomerProvider>
      <div className="flex flex-col h-screen overflow-hidden bg-[#F8F9FA]">
        {/* Dev mode banner */}
        {frontCtx.isDevMode && (
          <DevBanner selectedEmail={activeEmail} onSelect={setDevEmail} />
        )}

        {/* Initial loading state */}
        {frontCtx.loading && !frontCtx.isDevMode ? (
          <>
            <div className="flex-shrink-0 border-b border-[#E0E0E0] bg-white px-4 pt-3 pb-3">
              <span
                className="text-[18px] font-black tracking-tight"
                style={{ color: '#00B2A9', letterSpacing: '-0.5px' }}
              >
                scalapay
              </span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <SkeletonLoader />
            </div>
          </>
        ) : (
          <PluginBody
            activeEmail={activeEmail}
            conversationId={frontCtx.conversationId}
            loadingCustomer={loadingCustomer || frontCtx.loading}
          />
        )}
      </div>
    </CustomerProvider>
  )
}
