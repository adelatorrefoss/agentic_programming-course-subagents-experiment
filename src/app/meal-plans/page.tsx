"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
	daysForWeek,
	formatDay,
	MEAL_SLOTS,
	mondayFor,
	moveWeek,
} from "./calendar";
import {
	CookedDishOption,
	loadCookedDishCatalog,
	loadMealPlan,
	loadOrCreateMealPlan,
	loadShoppingList,
	MealSlot,
	removeMeal,
	saveMeal,
	ShoppingListItem,
	WeeklyMealPlan,
} from "./meal-plan-api";

import styles from "./page.module.css";

export default function MealPlansPage() {
	const [weekStart, setWeekStart] = useState(() => mondayFor(new Date()));
	const [plan, setPlan] = useState<WeeklyMealPlan | null>(null);
	const [dishes, setDishes] = useState<CookedDishOption[]>([]);
	const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
	const [isLoadingPlan, setIsLoadingPlan] = useState(true);
	const [isLoadingList, setIsLoadingList] = useState(true);
	const [pendingCell, setPendingCell] = useState<string | null>(null);
	const [planError, setPlanError] = useState<string | null>(null);
	const [catalogError, setCatalogError] = useState<string | null>(null);
	const [listError, setListError] = useState<string | null>(null);
	const days = useMemo(() => daysForWeek(weekStart), [weekStart]);

	const refreshShoppingList = useCallback(async (planId: string) => {
		setIsLoadingList(true);
		setListError(null);
		try {
			setShoppingList(await loadShoppingList(planId));
		} catch {
			setShoppingList([]);
			setListError("The shopping list could not be loaded.");
		} finally {
			setIsLoadingList(false);
		}
	}, []);

	const loadWeek = useCallback(async () => {
		setIsLoadingPlan(true);
		setIsLoadingList(true);
		setPlanError(null);
		setListError(null);
		try {
			const loadedPlan = await loadOrCreateMealPlan(weekStart);
			setPlan(loadedPlan);
			await refreshShoppingList(loadedPlan.id);
		} catch {
			setPlan(null);
			setShoppingList([]);
			setPlanError("This week could not be loaded. Please try again.");
			setIsLoadingList(false);
		} finally {
			setIsLoadingPlan(false);
		}
	}, [refreshShoppingList, weekStart]);

	useEffect(() => {
		void loadWeek();
	}, [loadWeek]);

	useEffect(() => {
		const loadDishes = async () => {
			setCatalogError(null);
			try {
				setDishes(await loadCookedDishCatalog());
			} catch {
				setCatalogError("Cooked dishes could not be loaded.");
			}
		};

		void loadDishes();
	}, []);

	const refreshAfterMutation = async (planId: string) => {
		const updatedPlan = await loadMealPlan(weekStart);
		setPlan(updatedPlan);
		await refreshShoppingList(planId);
	};

	const handleDishChange = async (
		day: string,
		slot: MealSlot,
		cookedDishId: string,
	) => {
		if (!plan || cookedDishId === "") {
			return;
		}
		const existing = plan.meals.find(
			(meal) => meal.day === day && meal.slot === slot,
		);
		const cell = `${day}-${slot}`;
		setPendingCell(cell);
		setPlanError(null);
		try {
			await saveMeal(
				plan.id,
				{ day, slot, cookedDishId },
				Boolean(existing),
			);
			await refreshAfterMutation(plan.id);
		} catch {
			setPlanError("The meal could not be saved. Please try again.");
		} finally {
			setPendingCell(null);
		}
	};

	const handleRemove = async (day: string, slot: MealSlot) => {
		if (!plan) {
			return;
		}
		const cell = `${day}-${slot}`;
		setPendingCell(cell);
		setPlanError(null);
		try {
			await removeMeal(plan.id, day, slot);
			await refreshAfterMutation(plan.id);
		} catch {
			setPlanError("The meal could not be removed. Please try again.");
		} finally {
			setPendingCell(null);
		}
	};

	return (
		<main className={styles.main}>
			<div className={styles.container}>
				<header className={styles.header}>
					<div>
						<Link href="/" className={styles.backLink}>
							← Home
						</Link>
						<h1>Weekly meal planner</h1>
						<p>
							Plan every meal and keep one consolidated shopping
							list.
						</p>
					</div>
					<nav
						className={styles.weekNavigation}
						aria-label="Week navigation"
					>
						<button
							type="button"
							onClick={() =>
								setWeekStart(moveWeek(weekStart, -1))
							}
						>
							Previous
						</button>
						<strong>Week of {formatDay(weekStart).date}</strong>
						<button
							type="button"
							onClick={() => setWeekStart(moveWeek(weekStart, 1))}
						>
							Next
						</button>
					</nav>
				</header>

				{planError && (
					<div role="alert" className={styles.error}>
						{planError}{" "}
						<button type="button" onClick={() => void loadWeek()}>
							Retry
						</button>
					</div>
				)}
				{catalogError && (
					<div role="alert" className={styles.error}>
						{catalogError}
					</div>
				)}

				<section
					aria-labelledby="planner-title"
					className={styles.plannerPanel}
				>
					<h2 id="planner-title" className={styles.visuallyHidden}>
						Meals for the week
					</h2>
					{isLoadingPlan ? (
						<p className={styles.status}>Loading weekly plan…</p>
					) : plan ? (
						<div className={styles.gridWrapper}>
							<div
								className={styles.grid}
								role="grid"
								aria-label="Weekly meal plan"
							>
								<div
									className={styles.corner}
									aria-hidden="true"
								/>
								{days.map((day) => {
									const label = formatDay(day);

									return (
										<div
											key={day}
											role="columnheader"
											className={styles.dayHeader}
										>
											<strong>{label.weekday}</strong>
											<span>{label.date}</span>
										</div>
									);
								})}
								{MEAL_SLOTS.map((slot) => (
									<MealRow
										key={slot}
										slot={slot}
										days={days}
										plan={plan}
										dishes={dishes}
										pendingCell={pendingCell}
										onChange={handleDishChange}
										onRemove={handleRemove}
									/>
								))}
							</div>
						</div>
					) : null}
					{!isLoadingPlan &&
						plan &&
						dishes.length === 0 &&
						!catalogError && (
							<p className={styles.hint}>
								Cook a dish from the home page before assigning
								meals.
							</p>
						)}
				</section>

				<section
					aria-labelledby="shopping-title"
					className={styles.shoppingPanel}
				>
					<div className={styles.panelHeading}>
						<div>
							<span>Consolidated</span>
							<h2 id="shopping-title">Shopping list</h2>
						</div>
						{!isLoadingList && !listError && (
							<span>{shoppingList.length} items</span>
						)}
					</div>
					{isLoadingList ? (
						<p className={styles.status}>Updating shopping list…</p>
					) : listError ? (
						<div role="alert" className={styles.error}>
							{listError}
							{plan && (
								<button
									type="button"
									onClick={() =>
										void refreshShoppingList(plan.id)
									}
								>
									Retry
								</button>
							)}
						</div>
					) : shoppingList.length === 0 ? (
						<p className={styles.empty}>
							Assign meals to start building your shopping list.
						</p>
					) : (
						<ul className={styles.shoppingList}>
							{shoppingList.map((item) => (
								<li
									key={`${item.type}-${item.name.toLowerCase()}`}
								>
									<span>
										{item.name}
										<small>{item.type}</small>
									</span>
									<strong>× {item.quantity}</strong>
								</li>
							))}
						</ul>
					)}
				</section>
			</div>
		</main>
	);
}

function MealRow({
	slot,
	days,
	plan,
	dishes,
	pendingCell,
	onChange,
	onRemove,
}: {
	slot: MealSlot;
	days: string[];
	plan: WeeklyMealPlan;
	dishes: CookedDishOption[];
	pendingCell: string | null;
	onChange: (day: string, slot: MealSlot, dishId: string) => void;
	onRemove: (day: string, slot: MealSlot) => void;
}) {
	return (
		<div role="row" className={styles.mealRow}>
			<div role="rowheader" className={styles.slotHeader}>
				{slot}
			</div>
			{days.map((day) => {
				const meal = plan.meals.find(
					(candidate) =>
						candidate.day === day && candidate.slot === slot,
				);
				const cell = `${day}-${slot}`;
				const busy = pendingCell === cell;

				return (
					<div role="gridcell" className={styles.mealCell} key={cell}>
						<label className={styles.visuallyHidden} htmlFor={cell}>
							{formatDay(day).weekday} {slot}
						</label>
						<select
							id={cell}
							value={meal?.cookedDishId ?? ""}
							disabled={busy || dishes.length === 0}
							onChange={(event) =>
								onChange(day, slot, event.target.value)
							}
						>
							<option value="">Choose dish</option>
							{dishes.map((dish) => (
								<option key={dish.id} value={dish.id}>
									{dish.name}
								</option>
							))}
						</select>
						{meal && (
							<button
								type="button"
								disabled={busy}
								onClick={() => onRemove(day, slot)}
								aria-label={`Remove ${slot} on ${formatDay(day).weekday}`}
							>
								{busy ? "…" : "Remove"}
							</button>
						)}
					</div>
				);
			})}
		</div>
	);
}
