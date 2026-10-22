"use client";

import { useState } from "react";
import AppBar from "../AppBar";
import ExternalLink from "../ExternalLink";
import { Icon } from "../Icons";
import { news } from "@/data/news";

export default function NewsPage() {
  const [reading, setReading] = useState(false);

  if (reading) {
    return (
      <>
        <AppBar title="How to read a page" onBack={() => setReading(false)} />
        <article className="card block article">
          <h2>How to read a kitchen transparency page</h2>
          <h3>Last verified</h3>
          <p>When the kitchen&apos;s manager last signed off a full set of checks. Older checks show as &quot;last known&quot;.</p>
          <h3>Evidence level</h3>
          <p>1 means photos, 2 means a sensor or document, 3 means an auditor visited. Level 1 is the lightest.</p>
          <h3>Self-reported, AI-checked</h3>
          <p>The kitchen reports its own checks and an AI reads the photos. This is not an official inspection.</p>
          <h3>Raids are &quot;reported&quot;</h3>
          <p>We link to the source post for every raid. &quot;No follow-up found in our sources&quot; means we found nothing. Silence is not proof either way.</p>
        </article>
      </>
    );
  }

  return (
    <>
      <AppBar title="News" subtitle="Reported raids, with sources" />
      <div className="stack">
        <p className="chip chip-grey" style={{ alignSelf: "flex-start" }}>
          <Icon name="alert" size={14} /> Real reports, separate from the sample restaurants
        </p>

        <button type="button" className="card explainer" onClick={() => setReading(true)}>
          <span className="tile-icon"><Icon name="news" /></span>
          <span className="grow">
            <strong>How to read a kitchen transparency page</strong>
            <span className="muted" style={{ display: "block" }}>2 minute read</span>
          </span>
          <Icon name="chevron" />
        </button>

        {news.map((n) => (
          <article key={n.id} className="card block">
            <p className="muted">
              {n.when} · {n.place}
            </p>
            <p style={{ margin: "4px 0 10px" }}>{n.summary}</p>
            <ExternalLink href={n.sourceUrl}>{n.sourceLabel}</ExternalLink>
          </article>
        ))}
      </div>
    </>
  );
}
