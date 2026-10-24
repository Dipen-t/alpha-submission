import { ArrowUpRight, Building2, Check } from "lucide-react";
import { stages } from "../data";
import type { Contact, Stage } from "../data";
import { Avatar, Labels, StageBadge, StageSelect } from "./ContactFields";
const stageClass = (stage: string) => stage.toLowerCase();
export function ContactTable({
  contacts,
  onOpen,
  onStageChange,
}: {
  contacts: Contact[];
  onOpen: (contact: Contact) => void;
  onStageChange: (id: string, stage: Stage) => void;
}) {
  return (
    <div className="table-scroll">
      <table>
        <caption className="sr-only">
          Business contacts. Open a contact to edit Stage and Notes.
        </caption>
        <thead>
          <tr>
            <th scope="col" className="name-column">
              Name
            </th>
            <th scope="col">Company</th>
            <th scope="col">Email</th>
            <th scope="col">Stage</th>
            <th scope="col">Owner</th>
            <th scope="col">Labels</th>
            <th scope="col">Notes</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              style={{ viewTransitionName: `contact-${contact.id}` }}
              onClick={(event) => {
                const target = event.target as HTMLElement;
                if (
                  target.closest(
                    "button, a, input, select, textarea, .quick-stage",
                  )
                )
                  return;
                const selection = window.getSelection();
                if (
                  selection?.toString() &&
                  event.currentTarget.contains(selection.anchorNode)
                )
                  return;
                // Keep one keyboard target per row and return focus to its name.
                event.currentTarget
                  .querySelector("button")
                  ?.focus({ preventScroll: true });
                onOpen(contact);
              }}
            >
              <td>
                <button
                  className="person-button"
                  style={{ viewTransitionName: `identity-${contact.id}` }}
                  onClick={() => onOpen(contact)}
                >
                  <Avatar name={contact.name} />
                  <span>
                    {contact.name}
                    <small>{contact.role || "Role not added"}</small>
                  </span>
                  <ArrowUpRight className="open-arrow" size={15} />
                </button>
              </td>
              <td>
                <span className="company-cell">
                  {contact.company && <Building2 size={14} />}
                  {contact.company || (
                    <span className="missing">Not added</span>
                  )}
                </span>
              </td>
              <td className="email-cell">
                {contact.email || <span className="missing">Not added</span>}
              </td>
              <td>
                <StageSelect
                  id={contact.id}
                  name={contact.name}
                  stage={contact.stage}
                  onChange={onStageChange}
                />
              </td>
              <td>
                {contact.owner ? (
                  <span className="owner">
                    <Avatar name={contact.owner} small />
                    {contact.owner}
                  </span>
                ) : (
                  <span className="missing">Unassigned</span>
                )}
              </td>
              <td>
                <Labels labels={contact.labels} />
              </td>
              <td className="note-cell">
                <span title={contact.notes || undefined}>
                  {contact.notes || (
                    <span className="missing">Add a note…</span>
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function ContactBoard({
  contacts,
  onOpen,
  onStageChange,
  isSearching = false,
}: {
  contacts: Contact[];
  onOpen: (contact: Contact) => void;
  onStageChange: (id: string, stage: Stage) => void;
  isSearching?: boolean;
}) {
  return (
    <div className="board">
      {stages.map((stage) => {
        const group = contacts.filter((contact) => contact.stage === stage);
        return (
          <section
            key={stage}
            className={`board-group ${stageClass(stage)}`}
            aria-label={`${stage} contacts`}
          >
            <div className="group-heading">
              <StageBadge stage={stage} />
              <span className="group-count">{group.length}</span>
            </div>
            <div className="cards">
              {group.map((contact) => (
                <article
                  className="contact-card"
                  style={{ viewTransitionName: `contact-${contact.id}` }}
                  key={contact.id}
                  onClick={(event) => {
                    if (
                      (event.target as HTMLElement).closest(
                        "button, select, .quick-stage",
                      )
                    )
                      return;
                    const selection = window.getSelection();
                    if (
                      selection?.toString() &&
                      event.currentTarget.contains(selection.anchorNode)
                    )
                      return;
                    event.currentTarget
                      .querySelector("button")
                      ?.focus({ preventScroll: true });
                    onOpen(contact);
                  }}
                >
                  <button
                    className="card-person"
                    type="button"
                    onClick={() => onOpen(contact)}
                    style={{ viewTransitionName: `identity-${contact.id}` }}
                  >
                    <Avatar name={contact.name} />
                    <span className="card-name">
                      {contact.name}
                      <small>{contact.role || "Role not added"}</small>
                    </span>
                    <ArrowUpRight className="open-arrow" size={15} />
                  </button>
                  <div className="card-meta">
                    <div className="card-company">
                      <Building2 size={14} />
                      {contact.company || "Company not added"}
                    </div>
                    <StageSelect
                      id={contact.id}
                      name={contact.name}
                      stage={contact.stage}
                      onChange={onStageChange}
                    />
                  </div>
                  <div className="card-footer">
                    <Labels labels={contact.labels} />
                    <span className="card-owner">
                      {contact.owner ? (
                        <>
                          <Avatar name={contact.owner} small />
                          {contact.owner}
                        </>
                      ) : (
                        "Unassigned"
                      )}
                    </span>
                  </div>
                </article>
              ))}
              {!group.length && (
                <div className="empty-group">
                  <span className="empty-icon">
                    <Check size={20} />
                  </span>
                  <strong>
                    {isSearching ? "No matching contacts" : "No contacts yet"}
                  </strong>
                  <p>
                    {isSearching
                      ? `No results in ${stage}. Try a different search.`
                      : `Move a contact to ${stage} when they’re ready.`}
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
