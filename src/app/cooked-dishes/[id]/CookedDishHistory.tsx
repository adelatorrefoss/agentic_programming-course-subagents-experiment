"use client";

import { ReactNode, useCallback, useEffect, useState } from "react";

import {
	CookedDishHistoryChange,
	CookedDishHistoryEntry,
	loadCookedDishHistory,
} from "./cooked-dish-history-api";

import styles from "./CookedDishHistory.module.css";

interface CookedDishHistoryProps {
	dishId: string;
}

const dateFormatter = new Intl.DateTimeFormat("en", {
	dateStyle: "medium",
	timeStyle: "short",
});

function fieldLabel(field: string): string {
	return field
		.replaceAll("_", " ")
		.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function valueContent(value: unknown): ReactNode {
	if (value === null || value === undefined || value === "") {
		return <span className={styles.emptyValue}>None</span>;
	}

	if (Array.isArray(value)) {
		if (value.length === 0) {
			return <span className={styles.emptyValue}>None</span>;
		}

		return (
			<ul className={styles.valueList}>
				{value.map((item, index) => (
					<li key={index}>{valueContent(item)}</li>
				))}
			</ul>
		);
	}

	if (typeof value === "object") {
		const entries = Object.entries(value);

		return (
			<span>
				{entries.map(([key, item], index) => (
					<span key={key}>
						{index > 0 ? " · " : ""}
						{fieldLabel(key)}: {String(item)}
					</span>
				))}
			</span>
		);
	}

	return String(value);
}

function ChangeDetails({ change }: { change: CookedDishHistoryChange }) {
	return (
		<div className={styles.change}>
			<dt>{fieldLabel(change.field)}</dt>
			<dd>
				<div>
					<span className={styles.valueLabel}>Previous</span>
					{valueContent(change.before)}
				</div>
				<div>
					<span className={styles.valueLabel}>New</span>
					{valueContent(change.after)}
				</div>
			</dd>
		</div>
	);
}

function HistoryEntry({ entry }: { entry: CookedDishHistoryEntry }) {
	return (
		<li className={styles.entry}>
			<div className={styles.entryHeader}>
				<strong>
					{entry.type === "cooked_dish.created"
						? "Created"
						: "Updated"}
				</strong>
				<time dateTime={entry.occurredAt}>
					{dateFormatter.format(new Date(entry.occurredAt))}
				</time>
			</div>
			<p className={styles.author}>By {entry.author}</p>
			<dl className={styles.changes}>
				{entry.changes.map((change, index) => (
					<ChangeDetails
						key={`${change.field}-${index}`}
						change={change}
					/>
				))}
			</dl>
		</li>
	);
}

export function CookedDishHistory({ dishId }: CookedDishHistoryProps) {
	const [entries, setEntries] = useState<CookedDishHistoryEntry[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(false);
	const [attempt, setAttempt] = useState(0);

	const retry = useCallback(() => setAttempt((current) => current + 1), []);

	useEffect(() => {
		const controller = new AbortController();
		setIsLoading(true);
		setError(false);

		void loadCookedDishHistory(dishId, controller.signal)
			.then((loadedEntries) => {
				if (!controller.signal.aborted) {
					setEntries(loadedEntries);
				}
			})
			.catch((requestError: unknown) => {
				if (
					!(
						requestError instanceof DOMException &&
						requestError.name === "AbortError"
					)
				) {
					setError(true);
				}
			})
			.finally(() => {
				if (!controller.signal.aborted) {
					setIsLoading(false);
				}
			});

		return () => controller.abort();
	}, [attempt, dishId]);

	return (
		<section className={styles.history} aria-labelledby="history-title">
			<h2 id="history-title" className={styles.title}>
				Change history
			</h2>
			{isLoading && <p className={styles.status}>Loading history…</p>}
			{!isLoading && error && (
				<div className={styles.error} role="alert">
					<p>The change history could not be loaded.</p>
					<button type="button" onClick={retry}>
						Retry
					</button>
				</div>
			)}
			{!isLoading && !error && entries.length === 0 && (
				<p className={styles.status}>No change history is available.</p>
			)}
			{!isLoading && !error && entries.length > 0 && (
				<ol className={styles.timeline}>
					{entries.map((entry) => (
						<HistoryEntry key={entry.id} entry={entry} />
					))}
				</ol>
			)}
		</section>
	);
}
