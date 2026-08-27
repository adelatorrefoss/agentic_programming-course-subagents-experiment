"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { FormEvent, useCallback, useEffect, useState } from "react";

import { CookedDishHistory } from "./CookedDishHistory";
import {
	loadFavoriteDishIds,
	saveFavoriteDishIds,
} from "../../favorite-dishes-storage";

import styles from "./page.module.css";

interface Ingredient {
	name: string;
	type: string;
}

interface CookedDish {
	id: string;
	name: string;
	description: string;
	ingredients: Ingredient[];
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
	const [isFavorite, setIsFavorite] = useState(false);
	const [favoriteError, setFavoriteError] = useState<string | null>(null);

	const [isEditing, setIsEditing] = useState(false);
	const [editName, setEditName] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [editIngredients, setEditIngredients] = useState<Ingredient[]>([]);
	const [editAuthor, setEditAuthor] = useState("");
	const [isSaving, setIsSaving] = useState(false);
	const [editError, setEditError] = useState<string | null>(null);
	const [editSuccess, setEditSuccess] = useState<string | null>(null);
	const [editValidationError, setEditValidationError] = useState<string | null>(null);

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

	useEffect(() => {
		try {
			const favoriteIds = loadFavoriteDishIds();
			setIsFavorite(favoriteIds.has(id));
		} catch {
			setFavoriteError(
				"Favorites could not be loaded. Please refresh the page.",
			);
		}
	}, [id]);

	const toggleFavorite = () => {
		setFavoriteError(null);
		try {
			const favoriteIds = loadFavoriteDishIds();
			const nextIsFavorite = !favoriteIds.has(id);
			if (nextIsFavorite) {
				favoriteIds.add(id);
			} else {
				favoriteIds.delete(id);
			}
			saveFavoriteDishIds(favoriteIds);
			setIsFavorite(nextIsFavorite);
		} catch {
			setFavoriteError(
				"We couldn't update favorites. Please check browser storage and try again.",
			);
		}
	};

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

	const startEditing = () => {
		if (!dish) return;
		setEditName(dish.name);
		setEditDescription(dish.description);
		setEditIngredients(dish.ingredients.map((i) => ({ ...i })));
		setEditAuthor("");
		setEditError(null);
		setEditSuccess(null);
		setEditValidationError(null);
		setIsEditing(true);
	};

	const cancelEditing = () => {
		setIsEditing(false);
		setEditError(null);
		setEditSuccess(null);
		setEditValidationError(null);
	};

	const updateIngredientName = (index: number, value: string) => {
		setEditIngredients((prev) =>
			prev.map((ing, i) => (i === index ? { ...ing, name: value } : ing)),
		);
	};

	const updateIngredientType = (index: number, value: string) => {
		setEditIngredients((prev) =>
			prev.map((ing, i) => (i === index ? { ...ing, type: value } : ing)),
		);
	};

	const addIngredient = () => {
		setEditIngredients((prev) => [...prev, { name: "", type: "main" }]);
	};

	const removeIngredient = (index: number) => {
		setEditIngredients((prev) => prev.filter((_, i) => i !== index));
	};

	const saveEdit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setEditValidationError(null);
		setEditError(null);
		setEditSuccess(null);

		if (!id) {
			setEditError("Unable to identify the dish. Please refresh the page.");
			return;
		}

		if (!editName.trim()) {
			setEditValidationError("Dish name is required.");
			return;
		}

		if (editIngredients.some((ing) => !ing.name.trim())) {
			setEditValidationError("All ingredient names must be filled in.");
			return;
		}

		if (!editAuthor.trim()) {
			setEditValidationError("Your name is required to save changes.");
			return;
		}

		setIsSaving(true);

		try {
			const response = await fetch(`/api/cooked-dishes/${id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					"X-Actor-Id": editAuthor.trim(),
				},
				body: JSON.stringify({
					name: editName.trim(),
					description: editDescription.trim(),
					ingredients: editIngredients.map((ing) => ({
						...ing,
						name: ing.name.trim(),
					})),
				}),
			});

			if (!response.ok) {
				throw new Error("Could not save changes. Please try again.");
			}

			setDish({
				id,
				name: editName.trim(),
				description: editDescription.trim(),
				ingredients: editIngredients.map((ing) => ({
					...ing,
					name: ing.name.trim(),
				})),
			});
			setEditSuccess("Changes saved successfully.");
			setIsEditing(false);
		} catch (saveError) {
			setEditError(
				saveError instanceof Error
					? saveError.message
					: "Could not save changes.",
			);
		} finally {
			setIsSaving(false);
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
						<button
							type="button"
							className={styles.favoriteButton}
							onClick={toggleFavorite}
						>
							{isFavorite
								? "Remove from favorites"
								: "Add to favorites"}
						</button>
						{favoriteError && (
							<p className={styles.formError} role="alert">
								{favoriteError}
							</p>
						)}
					</header>

					{editSuccess && (
						<p className={styles.formSuccess} role="status">
							{editSuccess}
						</p>
					)}

					{!isEditing && (
						<>
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

							<div className={styles.editActions}>
								<button
									type="button"
									className={styles.editButton}
									onClick={startEditing}
								>
									Edit dish
								</button>
							</div>
						</>
					)}

					{isEditing && (
						<form
							className={styles.editForm}
							onSubmit={saveEdit}
							aria-label="Edit dish"
						>
							<label>
								Dish name
								<input
									required
									maxLength={200}
									value={editName}
									onChange={(e) => setEditName(e.target.value)}
								/>
							</label>

							<label>
								Description
								<textarea
									rows={4}
									maxLength={2000}
									value={editDescription}
									onChange={(e) => setEditDescription(e.target.value)}
								/>
							</label>

							<fieldset className={styles.ingredientsFieldset}>
								<legend>Ingredients</legend>
								{editIngredients.map((ing, index) => (
									<div key={index} className={styles.ingredientRow}>
										<input
											aria-label={`Ingredient ${index + 1} name`}
											required
											maxLength={200}
											value={ing.name}
											onChange={(e) => updateIngredientName(index, e.target.value)}
											placeholder="Ingredient name"
										/>
										<select
											aria-label={`Ingredient ${index + 1} type`}
											value={ing.type}
											onChange={(e) => updateIngredientType(index, e.target.value)}
										>
											<option value="main">Main</option>
											<option value="household_staple">Pantry staple</option>
										</select>
										<button
											type="button"
											className={styles.removeIngredientButton}
											onClick={() => removeIngredient(index)}
											aria-label={`Remove ingredient ${ing.name || index + 1}`}
										>
											Remove
										</button>
									</div>
								))}
								<button
									type="button"
									className={styles.addIngredientButton}
									onClick={addIngredient}
								>
									Add ingredient
								</button>
							</fieldset>

							<label>
								Your name
								<input
									required
									maxLength={120}
									value={editAuthor}
									onChange={(e) => setEditAuthor(e.target.value)}
									placeholder="Required to save changes"
								/>
							</label>

							{editValidationError && (
								<p className={styles.formError} role="alert">
									{editValidationError}
								</p>
							)}
							{editError && (
								<p className={styles.formError} role="alert">
									{editError}
								</p>
							)}

							<div className={styles.editFormActions}>
								<button
									type="submit"
									className={styles.saveButton}
									disabled={isSaving}
								>
									{isSaving ? "Saving..." : "Save changes"}
								</button>
								<button
									type="button"
									className={styles.cancelButton}
									onClick={cancelEditing}
									disabled={isSaving}
								>
									Cancel
								</button>
							</div>
						</form>
					)}
				</article>

				<CookedDishHistory dishId={id} />

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
