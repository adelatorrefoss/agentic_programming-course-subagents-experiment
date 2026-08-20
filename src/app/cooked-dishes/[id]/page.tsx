"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

import styles from "./page.module.css";

interface CookedDish {
	id: string;
	name: string;
	description: string;
	ingredients: { name: string; type: string }[];
}

interface RatingSummary {
	average: number;
	total: number;
	distribution: Record<"1" | "2" | "3" | "4" | "5", number>;
}

const emptyRatingSummary: RatingSummary = {
	average: 0,
	total: 0,
	distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
};

export default function CookedDishDetail() {
	const params = useParams();
	const id = params.id as string;
	const [dish, setDish] = useState<CookedDish | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [ratingSummary, setRatingSummary] =
		useState<RatingSummary>(emptyRatingSummary);
	const [ratingsLoading, setRatingsLoading] = useState(true);
	const [ratingsError, setRatingsError] = useState<string | null>(null);
	const [author, setAuthor] = useState("");
	const [score, setScore] = useState(5);
	const [comment, setComment] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitMessage, setSubmitMessage] = useState<string | null>(null);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const fetchRatingSummary = useCallback(async () => {
		setRatingsLoading(true);
		setRatingsError(null);

		try {
			const response = await fetch(`/api/cooked-dishes/${id}/ratings`);
			if (!response.ok) {
				throw new Error("Could not load ratings");
			}

			setRatingSummary((await response.json()) as RatingSummary);
		} catch {
			setRatingsError("Could not load ratings");
		} finally {
			setRatingsLoading(false);
		}
	}, [id]);

	useEffect(() => {
		const fetchDish = async () => {
			try {
				const response = await fetch(`/api/cooked-dishes/${id}`);
				if (!response.ok) {
					throw new Error("Dish not found");
				}
				const data = await response.json();
				setDish(data);
			} catch {
				setError("Could not load the dish");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchDish();
	}, [id]);

	useEffect(() => {
		void fetchRatingSummary();
	}, [fetchRatingSummary]);

	const submitRating = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setIsSubmitting(true);
		setSubmitMessage(null);
		setSubmitError(null);

		try {
			const response = await fetch(`/api/cooked-dishes/${id}/ratings`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					author,
					score,
					comment: comment.trim() || null,
				}),
			});

			if (!response.ok) {
				const messages: Record<number, string> = {
					400: "Check the author, score and comment.",
					404: "This cooked dish no longer exists.",
					409: "You have already rated this dish.",
				};
				throw new Error(
					messages[response.status] ?? "Could not save rating.",
				);
			}

			setComment("");
			setSubmitMessage("Your rating was saved.");
			await fetchRatingSummary();
		} catch (submissionError) {
			setSubmitError(
				submissionError instanceof Error
					? submissionError.message
					: "Could not save rating.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<main className={styles.main}>
				<div className={styles.container}>
					<div className={styles.loading}>Loading...</div>
				</div>
			</main>
		);
	}

	if (error || !dish) {
		return (
			<main className={styles.main}>
				<div className={styles.container}>
					<div className={styles.error}>
						{error ?? "Dish not found"}
					</div>
					<Link href="/" className={styles.backLink}>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							width="20"
							height="20"
						>
							<path
								d="M19 12H5M12 19l-7-7 7-7"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
						<span>Back to home</span>
					</Link>
				</div>
			</main>
		);
	}

	const mainIngredients = dish.ingredients.filter((i) => i.type === "main");
	const stapleIngredients = dish.ingredients.filter(
		(i) => i.type === "household_staple",
	);

	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<Link href="/" className={styles.backLink}>
					<svg viewBox="0 0 24 24" fill="none" width="20" height="20">
						<path
							d="M19 12H5M12 19l-7-7 7-7"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
					<span>Back to home</span>
				</Link>

				<article className={styles.dish}>
					<header className={styles.dishHeader}>
						<div className={styles.badge}>Cooked</div>
						<h1 className={styles.dishName}>{dish.name}</h1>
					</header>

					<p className={styles.dishDescription}>{dish.description}</p>

					<section className={styles.ingredientsSection}>
						{mainIngredients.length > 0 && (
							<div className={styles.ingredientGroup}>
								<h2 className={styles.ingredientGroupTitle}>
									Main ingredients
								</h2>
								<ul className={styles.ingredientsList}>
									{mainIngredients.map(
										(ingredient, index) => (
											<li
												key={index}
												className={`${styles.ingredient} ${styles["ingredient--main"]}`}
											>
												{ingredient.name}
											</li>
										),
									)}
								</ul>
							</div>
						)}

						{stapleIngredients.length > 0 && (
							<div className={styles.ingredientGroup}>
								<h2 className={styles.ingredientGroupTitle}>
									Pantry staples
								</h2>
								<ul className={styles.ingredientsList}>
									{stapleIngredients.map(
										(ingredient, index) => (
											<li
												key={index}
												className={`${styles.ingredient} ${styles["ingredient--staple"]}`}
											>
												{ingredient.name}
											</li>
										),
									)}
								</ul>
							</div>
						)}
					</section>
				</article>

				<section
					className={styles.ratings}
					aria-labelledby="ratings-title"
				>
					<h2 id="ratings-title" className={styles.ratingsTitle}>
						Ratings
					</h2>

					{ratingsLoading && (
						<p className={styles.ratingsStatus}>
							Loading ratings...
						</p>
					)}
					{ratingsError && (
						<p className={styles.formError} role="alert">
							{ratingsError}
						</p>
					)}
					{!ratingsLoading && !ratingsError && (
						<div className={styles.ratingSummary}>
							<div className={styles.average}>
								<strong>
									{ratingSummary.average.toFixed(1)}
								</strong>
								<span>
									out of 5 · {ratingSummary.total} ratings
								</span>
							</div>
							<div className={styles.distribution}>
								{([5, 4, 3, 2, 1] as const).map((value) => {
									const count =
										ratingSummary.distribution[value];
									const width = ratingSummary.total
										? (count / ratingSummary.total) * 100
										: 0;

									return (
										<div
											className={styles.distributionRow}
											key={value}
										>
											<span>{value} ★</span>
											<div
												className={
													styles.distributionTrack
												}
											>
												<div
													className={
														styles.distributionFill
													}
													style={{
														width: `${width}%`,
													}}
												/>
											</div>
											<span>{count}</span>
										</div>
									);
								})}
							</div>
						</div>
					)}

					<form className={styles.ratingForm} onSubmit={submitRating}>
						<h3>Rate this dish</h3>
						<label>
							Your name
							<input
								required
								maxLength={120}
								value={author}
								onChange={(event) =>
									setAuthor(event.target.value)
								}
							/>
						</label>
						<label>
							Score
							<select
								value={score}
								onChange={(event) =>
									setScore(Number(event.target.value))
								}
							>
								{[5, 4, 3, 2, 1].map((value) => (
									<option value={value} key={value}>
										{value} {value === 1 ? "star" : "stars"}
									</option>
								))}
							</select>
						</label>
						<label>
							Comment (optional)
							<textarea
								maxLength={2000}
								rows={4}
								value={comment}
								onChange={(event) =>
									setComment(event.target.value)
								}
							/>
						</label>
						<button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Saving..." : "Submit rating"}
						</button>
						{submitMessage && (
							<p className={styles.formSuccess} role="status">
								{submitMessage}
							</p>
						)}
						{submitError && (
							<p className={styles.formError} role="alert">
								{submitError}
							</p>
						)}
					</form>
				</section>
			</div>
		</main>
	);
}
