"use client";

import Link from "next/link";
import React, { FormEvent, useEffect, useRef, useState } from "react";

import {
	CookedDishSearchCriteria,
	CookedDishSearchItem,
	DEFAULT_SEARCH_CRITERIA,
	IngredientType,
	loadCookedDishSearch,
} from "./cooked-dish-search";
import {
	loadFavoriteDishIds,
	saveFavoriteDishIds,
} from "./favorite-dishes-storage";

import styles from "./page.module.css";

interface SuggestedDish {
	name: string;
	description: string;
	ingredients: { name: string; type: string }[];
}

export default function Home() {
	const [ingredients, setIngredients] = useState<string[]>(["", "", ""]);
	const [suggestedDish, setSuggestedDish] = useState<SuggestedDish | null>(
		null,
	);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [cookedDishes, setCookedDishes] = useState<CookedDishSearchItem[]>(
		[],
	);
	const [isLoadingDishes, setIsLoadingDishes] = useState(true);
	const [searchForm, setSearchForm] = useState<CookedDishSearchCriteria>({
		...DEFAULT_SEARCH_CRITERIA,
	});
	const [searchCriteria, setSearchCriteria] =
		useState<CookedDishSearchCriteria>({ ...DEFAULT_SEARCH_CRITERIA });
	const [pagination, setPagination] = useState({
		page: 1,
		pageSize: 12,
		totalItems: 0,
		totalPages: 0,
	});
	const [dishSearchError, setDishSearchError] = useState<string | null>(null);
	const [favoriteDishIds, setFavoriteDishIds] = useState<Set<string>>(
		() => new Set(),
	);
	const [favoritesOnly, setFavoritesOnly] = useState(false);
	const [favoritesError, setFavoritesError] = useState<string | null>(null);
	const searchRequestIdRef = useRef(0);

	useEffect(() => {
		try {
			setFavoriteDishIds(loadFavoriteDishIds());
		} catch {
			setFavoritesError(
				"Favorites could not be loaded. Please refresh the page.",
			);
		}
	}, []);

	useEffect(() => {
		const requestId = ++searchRequestIdRef.current;
		const controller = new AbortController();
		const fetchCookedDishes = async () => {
			setIsLoadingDishes(true);
			setDishSearchError(null);
			try {
				const result = await loadCookedDishSearch(
					searchCriteria,
					controller.signal,
				);
				if (requestId === searchRequestIdRef.current) {
					setCookedDishes(result.items);
					setPagination(result.pagination);
				}
			} catch (searchError) {
				if (
					requestId === searchRequestIdRef.current &&
					!(
						searchError instanceof DOMException &&
						searchError.name === "AbortError"
					)
				) {
					setCookedDishes([]);
					setDishSearchError(
						"Cooked dishes could not be loaded. Please try again.",
					);
				}
			} finally {
				if (requestId === searchRequestIdRef.current) {
					setIsLoadingDishes(false);
				}
			}
		};

		void fetchCookedDishes();

		return () => controller.abort();
	}, [searchCriteria]);

	const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setSearchCriteria({ ...searchForm, page: 1 });
	};

	const handleSearchReset = () => {
		const defaults = { ...DEFAULT_SEARCH_CRITERIA };
		setSearchForm(defaults);
		setSearchCriteria(defaults);
	};

	const toggleIngredientType = (type: IngredientType) => {
		setSearchForm((current) => ({
			...current,
			ingredientTypes: current.ingredientTypes.includes(type)
				? current.ingredientTypes.filter(
						(candidate) => candidate !== type,
					)
				: [...current.ingredientTypes, type],
		}));
	};

	const handleIngredientChange = (index: number, value: string) => {
		const newIngredients = [...ingredients];
		newIngredients[index] = value;
		setIngredients(newIngredients);
	};

	const addIngredient = () => {
		setIngredients([...ingredients, ""]);
	};

	const removeIngredient = (index: number) => {
		if (ingredients.length > 1) {
			const newIngredients = ingredients.filter((_, i) => i !== index);
			setIngredients(newIngredients);
		}
	};

	const handleSuggest = async () => {
		setIsLoading(true);
		setError(null);
		setSuggestedDish(null);

		const userIngredients = ingredients
			.map((i) => i.trim().toLowerCase())
			.filter((i) => i !== "");

		try {
			const params = new URLSearchParams();
			for (const ing of userIngredients) {
				params.append("ingredients", ing);
			}
			const response = await fetch(
				`/api/dishes/suggest?${params.toString()}`,
			);

			if (!response.ok) {
				throw new Error("Failed to get dish suggestion");
			}

			const dish = await response.json();
			setSuggestedDish(dish);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Something went wrong",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const filledCount = ingredients.filter((i) => i.trim() !== "").length;

	const handleMarkAsCooked = async () => {
		if (!suggestedDish) {
			return;
		}

		try {
			const uuid = crypto.randomUUID();
			const response = await fetch(`/api/cooked-dishes/${uuid}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: suggestedDish.name,
					description: suggestedDish.description,
					ingredients: suggestedDish.ingredients,
				}),
			});

			if (!response.ok) {
				throw new Error("Failed to save dish");
			}

			setSearchCriteria((current) => ({ ...current, page: 1 }));
			setSuggestedDish(null);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save dish",
			);
		}
	};

	const handleDismissDish = () => {
		setSuggestedDish(null);
	};

	const toggleDishFavorite = (dishId: string) => {
		setFavoritesError(null);
		const updatedFavoriteIds = new Set(favoriteDishIds);
		if (updatedFavoriteIds.has(dishId)) {
			updatedFavoriteIds.delete(dishId);
		} else {
			updatedFavoriteIds.add(dishId);
		}

		try {
			saveFavoriteDishIds(updatedFavoriteIds);
			setFavoriteDishIds(updatedFavoriteIds);
		} catch {
			setFavoritesError(
				"We couldn't update favorites. Please check browser storage and try again.",
			);
		}
	};

	const visibleCookedDishes = favoritesOnly
		? cookedDishes.filter((dish) => favoriteDishIds.has(dish.id))
		: cookedDishes;

	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<header className={styles.header}>
					<div className={styles.logoMark}>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							className={styles.logoIcon}
						>
							<path
								d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
								fill="currentColor"
							/>
						</svg>
					</div>
					<h1 className={styles.title}>Neveraly</h1>
					<p className={styles.subtitle}>
						Tell us what's in your fridge, and we'll suggest the
						perfect dish
					</p>
				</header>
				<Link href="/meal-plans" className={styles.mealPlannerCta}>
					<span>
						<strong>Plan your week</strong>
						<small>21 meal slots and one shopping list</small>
					</span>
					<span aria-hidden="true">→</span>
				</Link>

				<section className={styles.inputSection}>
					<div className={styles.sectionHeader}>
						<span className={styles.sectionLabel}>
							Your ingredients
						</span>
						<span className={styles.counter}>
							{filledCount} added
						</span>
					</div>

					<div className={styles.ingredientsList}>
						{ingredients.map((ingredient, index) => (
							<div
								key={index}
								className={styles.ingredientRow}
								style={{ animationDelay: `${index * 50}ms` }}
							>
								<div className={styles.inputWrapper}>
									<span className={styles.inputNumber}>
										{index + 1}
									</span>
									<input
										type="text"
										value={ingredient}
										onChange={(e) =>
											handleIngredientChange(
												index,
												e.target.value,
											)
										}
										placeholder="e.g. tomatoes, chicken, rice..."
										className={styles.input}
									/>
									{ingredients.length > 1 && (
										<button
											onClick={() =>
												removeIngredient(index)
											}
											className={styles.removeButton}
											aria-label="Remove ingredient"
										>
											<svg
												viewBox="0 0 24 24"
												fill="none"
												width="18"
												height="18"
											>
												<path
													d="M18 6L6 18M6 6l12 12"
													stroke="currentColor"
													strokeWidth="2"
													strokeLinecap="round"
												/>
											</svg>
										</button>
									)}
								</div>
							</div>
						))}
					</div>

					<button
						onClick={addIngredient}
						className={styles.addButton}
					>
						<svg
							viewBox="0 0 24 24"
							fill="none"
							width="20"
							height="20"
						>
							<path
								d="M12 5v14M5 12h14"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
							/>
						</svg>
						<span>Add another ingredient</span>
					</button>
				</section>

				<button
					onClick={handleSuggest}
					className={styles.suggestButton}
					disabled={filledCount === 0 || isLoading}
				>
					<span className={styles.buttonText}>
						{isLoading ? "Thinking..." : "Suggest a dish"}
					</span>
					{!isLoading && (
						<svg
							viewBox="0 0 24 24"
							fill="none"
							width="20"
							height="20"
							className={styles.buttonIcon}
						>
							<path
								d="M5 12h14M12 5l7 7-7 7"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					)}
				</button>

				{error && <div className={styles.error}>{error}</div>}

				{suggestedDish && (
					<section className={styles.dish}>
						<h2 className={styles.dish__name}>
							{suggestedDish.name}
						</h2>
						<p className={styles.dish__description}>
							{suggestedDish.description}
						</p>
						<div className={styles.dish__ingredientsSection}>
							<span className={styles.dish__ingredientsLabel}>
								Ingredients:
							</span>
							<ul className={styles.dish__ingredientsList}>
								{suggestedDish.ingredients.map(
									(ingredient, index) => (
										<li
											key={index}
											className={`${styles.dish__ingredient} ${
												ingredient.type === "main"
													? styles[
															"dish__ingredient--main"
														]
													: styles[
															"dish__ingredient--staple"
														]
											}`}
										>
											{ingredient.name}
										</li>
									),
								)}
							</ul>
						</div>
						<div className={styles.dish__actions}>
							<span className={styles.dish__question}>
								Did you make this dish?
							</span>
							<div className={styles.dish__buttons}>
								<button
									onClick={handleMarkAsCooked}
									className={styles.dish__checkButton}
									aria-label="Yes, I made this dish"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										width="20"
										height="20"
									>
										<path
											d="M20 6L9 17l-5-5"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
											strokeLinejoin="round"
										/>
									</svg>
								</button>
								<button
									onClick={handleDismissDish}
									className={styles.dish__dismissButton}
									aria-label="No, dismiss this dish"
								>
									<svg
										viewBox="0 0 24 24"
										fill="none"
										width="20"
										height="20"
									>
										<path
											d="M18 6L6 18M6 6l12 12"
											stroke="currentColor"
											strokeWidth="2"
											strokeLinecap="round"
										/>
									</svg>
								</button>
							</div>
						</div>
					</section>
				)}

				<section
					className={styles.cookedDishesSection}
					aria-labelledby="cooked-dishes-title"
				>
					<div className={styles.sectionHeader}>
						<span
							id="cooked-dishes-title"
							className={styles.sectionLabel}
						>
							Your cooked dishes
						</span>
						{!isLoadingDishes && !dishSearchError && (
							<span className={styles.counter} aria-live="polite">
								{favoritesOnly
									? `${visibleCookedDishes.length} favorite ${visibleCookedDishes.length === 1 ? "dish" : "dishes"}`
									: `${pagination.totalItems} dishes`}
							</span>
						)}
					</div>

					<div className={styles.searchActions}>
						<button
							type="button"
							onClick={() => setFavoritesOnly((current) => !current)}
							disabled={isLoadingDishes || !!dishSearchError}
						>
							{favoritesOnly
								? "Show all dishes"
								: "Show favorites only"}
						</button>
					</div>
					{favoritesError && (
						<div role="alert" className={styles.searchError}>
							<span>{favoritesError}</span>
							<button
								type="button"
								onClick={() => setFavoritesError(null)}
							>
								Dismiss
							</button>
						</div>
					)}

					<form
						className={styles.searchForm}
						onSubmit={handleSearchSubmit}
					>
						<label className={styles.searchFieldWide}>
							<span>Search name or description</span>
							<input
								type="search"
								value={searchForm.text}
								maxLength={100}
								onChange={(event) =>
									setSearchForm((current) => ({
										...current,
										text: event.target.value,
									}))
								}
								placeholder="e.g. soup"
							/>
						</label>

						<fieldset className={styles.searchTypes}>
							<legend>Ingredient types</legend>
							<label>
								<input
									type="checkbox"
									checked={searchForm.ingredientTypes.includes(
										"main",
									)}
									onChange={() =>
										toggleIngredientType("main")
									}
								/>
								Main
							</label>
							<label>
								<input
									type="checkbox"
									checked={searchForm.ingredientTypes.includes(
										"household_staple",
									)}
									onChange={() =>
										toggleIngredientType("household_staple")
									}
								/>
								Household staple
							</label>
						</fieldset>

						<label>
							<span>Minimum rating</span>
							<select
								value={searchForm.minimumRating}
								onChange={(event) =>
									setSearchForm((current) => ({
										...current,
										minimumRating: event.target.value,
									}))
								}
							>
								<option value="">Any rating</option>
								{[0, 1, 2, 3, 4, 5].map((rating) => (
									<option key={rating} value={rating}>
										{rating}+ stars
									</option>
								))}
							</select>
						</label>

						<label>
							<span>Cooked from</span>
							<input
								type="date"
								value={searchForm.cookedFrom}
								max={searchForm.cookedTo || undefined}
								onChange={(event) =>
									setSearchForm((current) => ({
										...current,
										cookedFrom: event.target.value,
									}))
								}
							/>
						</label>

						<label>
							<span>Cooked to</span>
							<input
								type="date"
								value={searchForm.cookedTo}
								min={searchForm.cookedFrom || undefined}
								onChange={(event) =>
									setSearchForm((current) => ({
										...current,
										cookedTo: event.target.value,
									}))
								}
							/>
						</label>

						<label>
							<span>Sort by</span>
							<select
								value={searchForm.sortBy}
								onChange={(event) =>
									setSearchForm((current) => ({
										...current,
										sortBy: event.target
											.value as CookedDishSearchCriteria["sortBy"],
									}))
								}
							>
								<option value="cookedAt">Cooked date</option>
								<option value="name">Name</option>
								<option value="rating">Rating</option>
							</select>
						</label>

						<label>
							<span>Direction</span>
							<select
								value={searchForm.sortDirection}
								onChange={(event) =>
									setSearchForm((current) => ({
										...current,
										sortDirection: event.target
											.value as CookedDishSearchCriteria["sortDirection"],
									}))
								}
							>
								<option value="desc">Descending</option>
								<option value="asc">Ascending</option>
							</select>
						</label>

						<div className={styles.searchActions}>
							<button type="submit" disabled={isLoadingDishes}>
								Search dishes
							</button>
							<button type="button" onClick={handleSearchReset}>
								Reset filters
							</button>
						</div>
					</form>

					{isLoadingDishes ? (
						<p className={styles.searchStatus} aria-live="polite">
							Loading cooked dishes…
						</p>
					) : dishSearchError ? (
						<div role="alert" className={styles.searchError}>
							<span>{dishSearchError}</span>
							<button
								type="button"
								onClick={() =>
									setSearchCriteria((current) => ({
										...current,
									}))
								}
							>
								Retry
							</button>
						</div>
					) : cookedDishes.length === 0 ? (
						<p className={styles.searchStatus}>
							No cooked dishes match these filters.
						</p>
					) : favoritesOnly && visibleCookedDishes.length === 0 ? (
						<div className={styles.searchStatus}>
							<p>
								You do not have favorite dishes in this result
								set yet.
							</p>
							<button
								type="button"
								onClick={() => setFavoritesOnly(false)}
							>
								View all cooked dishes
							</button>
						</div>
					) : (
						<>
							<div className={styles.sectionHeader}>
								<span className={styles.counter}>
									Showing {visibleCookedDishes.length} of{" "}
									{pagination.totalItems}
								</span>
								<span className={styles.counter}>
									Page {pagination.page} of{" "}
									{pagination.totalPages}
								</span>
							</div>
							<div className={styles.cookedDishesList}>
								{visibleCookedDishes.map((dish) => (
									<div
										key={dish.id}
										className={styles.cookedDishCardWrapper}
									>
										<Link
											href={`/cooked-dishes/${dish.id}`}
											className={styles.cookedDishCardLink}
										>
											<article
												className={styles.cookedDishCard}
											>
											<h3
												className={
													styles.cookedDishCard__name
												}
											>
												{dish.name}
											</h3>
											<p
												className={
													styles.cookedDishCard__description
												}
											>
												{dish.description}
											</p>
											<div
												className={
													styles.cookedDishCard__rating
												}
												aria-label={
													dish.ratingSummary.total ===
													0
														? "Not rated yet"
														: `${dish.ratingSummary.average?.toFixed(1)} out of 5 from ${dish.ratingSummary.total} ratings`
												}
											>
												<span aria-hidden="true">
													★
												</span>
												{dish.ratingSummary.total ===
												0 ? (
													<span>Not rated yet</span>
												) : (
													<>
														<strong>
															{dish.ratingSummary.average?.toFixed(
																1,
															)}
														</strong>
														<span>
															{dish.ratingSummary
																.total === 1
																? "1 rating"
																: `${dish.ratingSummary.total} ratings`}
														</span>
													</>
												)}
											</div>
											<ul
												className={
													styles.cookedDishCard__ingredients
												}
											>
												{dish.ingredients.map(
													(ingredient, index) => (
														<li
															key={index}
															className={`${styles.dish__ingredient} ${
																ingredient.type ===
																"main"
																	? styles[
																			"dish__ingredient--main"
																		]
																	: styles[
																			"dish__ingredient--staple"
																		]
															}`}
														>
															{ingredient.name}
														</li>
													),
												)}
											</ul>
											</article>
										</Link>
										<button
											type="button"
											className={styles.favoriteButton}
											onClick={() =>
												toggleDishFavorite(dish.id)
											}
										>
											{favoriteDishIds.has(dish.id)
												? `Remove ${dish.name} from favorites`
												: `Add ${dish.name} to favorites`}
										</button>
									</div>
								))}
							</div>
							<nav
								className={styles.pagination}
								aria-label="Cooked dish result pages"
							>
								<button
									type="button"
									disabled={
										pagination.page <= 1 || isLoadingDishes
									}
									onClick={() =>
										setSearchCriteria((current) => ({
											...current,
											page: current.page - 1,
										}))
									}
								>
									Previous page
								</button>
								<button
									type="button"
									disabled={
										pagination.page >=
											pagination.totalPages ||
										isLoadingDishes
									}
									onClick={() =>
										setSearchCriteria((current) => ({
											...current,
											page: current.page + 1,
										}))
									}
								>
									Next page
								</button>
							</nav>
						</>
					)}
				</section>

				<footer className={styles.footer}>
					<p>Powered by Codely & Local AI…</p>
				</footer>
			</div>
		</main>
	);
}
