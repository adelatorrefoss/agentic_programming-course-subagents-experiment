import { AggregateRoot } from "../../../shared/domain/AggregateRoot";
import { Ingredient } from "../../../shared/domain/Ingredient";
import { IngredientType } from "../../../shared/domain/IngredientType";

import { CookedDishCreatedDomainEvent } from "./CookedDishCreatedDomainEvent";
import { CookedDishId } from "./CookedDishId";
import {
	CookedDishSnapshot,
	CookedDishUpdatedFields,
} from "./CookedDishSnapshot";
import { CookedDishUpdatedDomainEvent } from "./CookedDishUpdatedDomainEvent";

export interface CookedDishPrimitives {
	id: string;
	name: string;
	description: string;
	ingredients: { name: string; type: string }[];
}

export class CookedDish extends AggregateRoot {
	constructor(
		readonly id: CookedDishId,
		readonly name: string,
		readonly description: string,
		readonly ingredients: Ingredient[],
	) {
		super();
	}

	static create(
		id: string,
		name: string,
		description: string,
		ingredients: { name: string; type: string }[],
		author: string,
	): CookedDish {
		const dish = new CookedDish(
			new CookedDishId(id),
			name,
			description,
			ingredients.map(
				(ingredient) =>
					new Ingredient(
						ingredient.name,
						ingredient.type as IngredientType,
					),
			),
		);
		dish.record(
			new CookedDishCreatedDomainEvent(id, author, dish.toSnapshot()),
		);

		return dish;
	}

	static fromPrimitives(primitives: CookedDishPrimitives): CookedDish {
		return new CookedDish(
			new CookedDishId(primitives.id),
			primitives.name,
			primitives.description,
			primitives.ingredients.map(
				(ingredient) =>
					new Ingredient(
						ingredient.name,
						ingredient.type as IngredientType,
					),
			),
		);
	}

	update(
		name: string,
		description: string,
		ingredients: { name: string; type: string }[],
		author: string,
	): CookedDish {
		const updated = CookedDish.fromPrimitives({
			id: this.id.value,
			name,
			description,
			ingredients,
		});
		const previous = this.toSnapshot();
		const current = updated.toSnapshot();
		const fields = this.changedFields(previous, current);

		if (Object.keys(fields).length > 0) {
			updated.record(
				new CookedDishUpdatedDomainEvent(
					this.id.value,
					author,
					previous,
					current,
					fields,
				),
			);
		}

		return updated;
	}

	toPrimitives(): CookedDishPrimitives {
		return {
			id: this.id.value,
			name: this.name,
			description: this.description,
			ingredients: this.ingredients.map((ingredient) =>
				ingredient.toPrimitives(),
			),
		};
	}

	private toSnapshot(): CookedDishSnapshot {
		const { name, description, ingredients } = this.toPrimitives();

		return { name, description, ingredients };
	}

	private changedFields(
		previous: CookedDishSnapshot,
		current: CookedDishSnapshot,
	): CookedDishUpdatedFields {
		const fields: CookedDishUpdatedFields = {};

		if (previous.name !== current.name) {
			fields.name = { from: previous.name, to: current.name };
		}

		if (previous.description !== current.description) {
			fields.description = {
				from: previous.description,
				to: current.description,
			};
		}

		if (
			JSON.stringify(previous.ingredients) !==
			JSON.stringify(current.ingredients)
		) {
			fields.ingredients = {
				from: previous.ingredients,
				to: current.ingredients,
			};
		}

		return fields;
	}
}
