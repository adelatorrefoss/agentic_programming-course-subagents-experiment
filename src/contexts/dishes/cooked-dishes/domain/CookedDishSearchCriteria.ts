import { IngredientType } from "../../../shared/domain/IngredientType";

import { InvalidCookedDishSearchCriteriaError } from "./InvalidCookedDishSearchCriteriaError";

export const COOKED_DISH_SORT_FIELDS = ["cookedAt", "name", "rating"] as const;
export const SORT_DIRECTIONS = ["asc", "desc"] as const;

export type CookedDishSortField = (typeof COOKED_DISH_SORT_FIELDS)[number];
export type SortDirection = (typeof SORT_DIRECTIONS)[number];

export interface RawCookedDishSearchCriteria {
	text?: string;
	ingredientTypes?: string[];
	minimumRating?: number | string;
	cookedFrom?: string;
	cookedTo?: string;
	sortBy?: string;
	sortDirection?: string;
	page?: number | string;
	pageSize?: number | string;
}

export class CookedDishSearchCriteria {
	static readonly DEFAULT_PAGE = 1;
	static readonly DEFAULT_PAGE_SIZE = 12;
	static readonly MAX_PAGE_SIZE = 50;

	private constructor(
		readonly text: string | undefined,
		readonly ingredientTypes: IngredientType[],
		readonly minimumRating: number | undefined,
		readonly cookedFrom: string | undefined,
		readonly cookedTo: string | undefined,
		readonly sortBy: CookedDishSortField,
		readonly sortDirection: SortDirection,
		readonly page: number,
		readonly pageSize: number,
	) {}

	static create(
		raw: RawCookedDishSearchCriteria = {},
	): CookedDishSearchCriteria {
		const text = this.validateText(raw.text);
		const ingredientTypes = this.validateIngredientTypes(
			raw.ingredientTypes ?? [],
		);
		const minimumRating = this.validateMinimumRating(raw.minimumRating);
		const cookedFrom = this.validateDate("cookedFrom", raw.cookedFrom);
		const cookedTo = this.validateDate("cookedTo", raw.cookedTo);

		if (cookedFrom && cookedTo && cookedFrom > cookedTo) {
			throw new InvalidCookedDishSearchCriteriaError(
				"cookedFrom",
				cookedFrom,
				"must not be after cookedTo",
			);
		}

		const sortBy = this.validateAllowed(
			"sortBy",
			raw.sortBy ?? "cookedAt",
			COOKED_DISH_SORT_FIELDS,
		);
		const sortDirection = this.validateAllowed(
			"sortDirection",
			raw.sortDirection ?? "desc",
			SORT_DIRECTIONS,
		);
		const page = this.validateInteger(
			"page",
			raw.page ?? this.DEFAULT_PAGE,
			1,
			Number.MAX_SAFE_INTEGER,
		);
		const pageSize = this.validateInteger(
			"pageSize",
			raw.pageSize ?? this.DEFAULT_PAGE_SIZE,
			1,
			this.MAX_PAGE_SIZE,
		);

		return new CookedDishSearchCriteria(
			text,
			ingredientTypes,
			minimumRating,
			cookedFrom,
			cookedTo,
			sortBy,
			sortDirection,
			page,
			pageSize,
		);
	}

	get offset(): number {
		return (this.page - 1) * this.pageSize;
	}

	private static validateText(text: string | undefined): string | undefined {
		if (text === undefined) {
			return undefined;
		}

		const normalized = text.trim();
		if (normalized.length < 1 || normalized.length > 100) {
			throw new InvalidCookedDishSearchCriteriaError(
				"text",
				text,
				"must contain between 1 and 100 characters",
			);
		}

		return normalized;
	}

	private static validateIngredientTypes(values: string[]): IngredientType[] {
		const allowed = Object.values(IngredientType);
		for (const value of values) {
			if (!allowed.includes(value as IngredientType)) {
				throw new InvalidCookedDishSearchCriteriaError(
					"ingredientType",
					value,
					"is not an allowed ingredient type",
				);
			}
		}

		return [...new Set(values)] as IngredientType[];
	}

	private static validateMinimumRating(
		value: number | string | undefined,
	): number | undefined {
		if (value === undefined) {
			return undefined;
		}

		const parsed =
			typeof value === "string" && value.trim() === ""
				? Number.NaN
				: Number(value);
		if (!Number.isFinite(parsed) || parsed < 0 || parsed > 5) {
			throw new InvalidCookedDishSearchCriteriaError(
				"minimumRating",
				value,
				"must be a number between 0 and 5",
			);
		}

		return parsed;
	}

	private static validateDate(
		field: "cookedFrom" | "cookedTo",
		value: string | undefined,
	): string | undefined {
		if (value === undefined) {
			return undefined;
		}

		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
		const date = match ? new Date(`${value}T00:00:00.000Z`) : null;
		if (
			!date ||
			Number.isNaN(date.getTime()) ||
			date.toISOString().slice(0, 10) !== value
		) {
			throw new InvalidCookedDishSearchCriteriaError(
				field,
				value,
				"must be a valid ISO date (YYYY-MM-DD)",
			);
		}

		return value;
	}

	private static validateAllowed<T extends string>(
		field: string,
		value: string,
		allowed: readonly T[],
	): T {
		if (!allowed.includes(value as T)) {
			throw new InvalidCookedDishSearchCriteriaError(
				field,
				value,
				`must be one of: ${allowed.join(", ")}`,
			);
		}

		return value as T;
	}

	private static validateInteger(
		field: string,
		value: number | string,
		minimum: number,
		maximum: number,
	): number {
		const parsed =
			typeof value === "string" && value.trim() === ""
				? Number.NaN
				: Number(value);
		if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
			throw new InvalidCookedDishSearchCriteriaError(
				field,
				value,
				`must be an integer between ${minimum} and ${maximum}`,
			);
		}

		return parsed;
	}
}
