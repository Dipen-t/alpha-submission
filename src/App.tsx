import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Check, Columns3, Search, Table2, UsersRound, X } from "lucide-react";
import { initialContacts } from "./data";
import type { Contact, Stage } from "./data";
import { ContactTable, ContactBoard } from "./components/ContactViews";
import { DetailsPanel } from "./components/DetailsPanel";
export default function App() {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [view, setView] = useState<"table" | "board">("table");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const trigger = useRef<HTMLElement | null>(null);
  const viewButton = useRef<HTMLButtonElement>(null);
  const targetView = useRef(view);
  const transition = useRef<ReturnType<Document["startViewTransition"]> | null>(
    null,
  );
  const changeView = (next: "table" | "board") => {
    if (targetView.current === next) return;
    targetView.current = next;
    transition.current?.skipTransition();
    const reducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (!document.startViewTransition || reducedMotion) {
      setView(next);
      return;
    }
    // Snapshot each contact before and after React replaces the view.
    // Reading the latest target also keeps fast, repeated toggles in order.
    const active = document.startViewTransition(() => {
      flushSync(() => setView(targetView.current));
    });
    transition.current = active;
    void active.ready.catch(() => {});
    void active.finished
      .catch(() => {})
      .finally(() => {
        if (transition.current === active) transition.current = null;
      });
  };
  const current = contacts.find((contact) => contact.id === selected);
  const visibleContacts = contacts.filter((contact) =>
    [
      contact.name,
      contact.company,
      contact.email,
      contact.role,
      contact.owner,
      ...contact.labels,
    ]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [notice]);
  const open = (contact: Contact) => {
    trigger.current = document.activeElement as HTMLElement;
    setSelected(contact.id);
  };
  const close = () => {
    setSelected(null);
    requestAnimationFrame(() => {
      if (trigger.current?.isConnected) trigger.current.focus();
      else viewButton.current?.focus();
    });
  };
  const save = (id: string, stage: Stage, notes: string) => {
    setContacts((previous) =>
      previous.map((contact) =>
        contact.id === id ? { ...contact, stage, notes } : contact,
      ),
    );
    setNotice(`Changes saved for ${current?.name}.`);
    close();
  };
  const changeStage = (id: string, stage: Stage) => {
    const contact = contacts.find((person) => person.id === id);
    if (!contact || contact.stage === stage) return;
    setContacts((previous) =>
      previous.map((person) =>
        person.id === id ? { ...person, stage } : person,
      ),
    );
    setNotice(`${contact.name} moved to ${stage}.`);
    // A board move remounts the card in another group. Keep keyboard focus on it.
    requestAnimationFrame(() =>
      document.getElementById(`quick-stage-${id}`)?.focus(),
    );
  };
  return (
    <div className="app-shell">
      <div className="main-shell">
        <main id="main">
          <div className="page-heading">
            <div>
              <h1>Contacts</h1>
              <p>Keep your people and next steps in one place.</p>
            </div>
            <span className="contact-total">
              <UsersRound size={15} />
              {contacts.length} contacts
            </span>
          </div>
          <div className="view-toolbar">
            <div className="view-switch" role="group" aria-label="Contact view">
              <button
                ref={viewButton}
                aria-pressed={view === "table"}
                className={view === "table" ? "selected" : ""}
                onClick={() => changeView("table")}
              >
                <Table2 size={16} />
                Table
              </button>
              <button
                aria-pressed={view === "board"}
                className={view === "board" ? "selected" : ""}
                onClick={() => changeView("board")}
              >
                <Columns3 size={16} />
                Board
              </button>
            </div>
            <div className="toolbar-right">
              <label className="search">
                <Search size={15} />
                <input
                  type="search"
                  placeholder="Search contacts…"
                  aria-label="Search contacts"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
            </div>
          </div>
          <div className="view-description">
            <span>
              {view === "table" ? "All contacts" : "Grouped by stage"}
            </span>
            <span>
              {view === "table"
                ? "Select a row to edit a contact"
                : "Select a card to edit a contact"}
            </span>
          </div>
          <div className="contact-view">
            {view === "table" ? (
              <ContactTable
                contacts={visibleContacts}
                onOpen={open}
                onStageChange={changeStage}
              />
            ) : (
              <ContactBoard
                contacts={visibleContacts}
                onOpen={open}
                onStageChange={changeStage}
                isSearching={Boolean(query.trim())}
              />
            )}
          </div>
          {!visibleContacts.length && view === "table" && (
            <div className="empty-search">
              <Search size={25} />
              <h2>No contacts found</h2>
              <p>Try another name, company, or email.</p>
              <button className="secondary-button" onClick={() => setQuery("")}>
                Clear search
              </button>
            </div>
          )}
          <div className="view-footer">
            <span>
              {query
                ? `${visibleContacts.length} of ${contacts.length}`
                : contacts.length}{" "}
              contacts
            </span>
            <span>
              <span className="footer-dot" />
              One shared list. Always in sync.
            </span>
          </div>
        </main>
        <footer className="app-footer">
          <span>Changes are saved for this session.</span>
          <span>
            Alpha design exercise <span className="footer-divider">/</span>{" "}
            Fictional contacts
          </span>
        </footer>
      </div>
      {current && (
        <DetailsPanel
          key={current.id}
          contact={current}
          onClose={close}
          onSave={save}
        />
      )}
      <div
        className={`toast ${notice ? "visible" : ""}`}
        role="status"
        aria-live="polite"
      >
        {notice && (
          <>
            <Check size={16} />
            {notice}
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={15} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
