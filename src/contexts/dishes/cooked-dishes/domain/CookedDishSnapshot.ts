export interface CookedDishSnapshot {
	name: string;
	description: string;
	ingredients: { name: string; type: string }[];
}

export type CookedDishUpdatedFields = Partial<{
	name: { from: string; to: string };
	description: { from: string; to: string };
	ingredients: {
		from: { name: string; type: string }[];
		to: { name: string; type: string }[];
	};
}>;
