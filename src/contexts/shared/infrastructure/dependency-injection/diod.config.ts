import "reflect-metadata";

import { ContainerBuilder } from "diod";

import { CookedDishAuditRecorder } from "../../../dishes/cooked-dish-history/application/record/CookedDishAuditRecorder";
import { CookedDishHistorySearcher } from "../../../dishes/cooked-dish-history/application/search/CookedDishHistorySearcher";
import { CookedDishAuditRepository } from "../../../dishes/cooked-dish-history/domain/CookedDishAuditRepository";
import { PostgresCookedDishAuditRepository } from "../../../dishes/cooked-dish-history/infrastructure/PostgresCookedDishAuditRepository";
import { CookedDishRatingAdder } from "../../../dishes/cooked-dish-ratings/application/add/CookedDishRatingAdder";
import { CookedDishRatingsSummarizer } from "../../../dishes/cooked-dish-ratings/application/summary/CookedDishRatingsSummarizer";
import { CookedDishRatingRepository } from "../../../dishes/cooked-dish-ratings/domain/CookedDishRatingRepository";
import { PostgresCookedDishRatingRepository } from "../../../dishes/cooked-dish-ratings/infrastructure/PostgresCookedDishRatingRepository";
import { CookedDishCreator } from "../../../dishes/cooked-dishes/application/create/CookedDishCreator";
import { CookedDishesSearcher } from "../../../dishes/cooked-dishes/application/search/CookedDishesSearcher";
import { AllCookedDishesSearcher } from "../../../dishes/cooked-dishes/application/search-all/AllCookedDishesSearcher";
import { CookedDishByIdSearcher } from "../../../dishes/cooked-dishes/application/search-by-id/CookedDishByIdSearcher";
import { CookedDishesBySimilarIngredientsSearcher } from "../../../dishes/cooked-dishes/application/search-by-similar-ingredients/CookedDishesBySimilarIngredientsSearcher";
import { CookedDishUpserter } from "../../../dishes/cooked-dishes/application/upsert/CookedDishUpserter";
import { CookedDishRepository } from "../../../dishes/cooked-dishes/domain/CookedDishRepository";
import { PostgresCookedDishRepository } from "../../../dishes/cooked-dishes/infrastructure/PostgresCookedDishRepository";
import { DishByIngredientsSuggester } from "../../../dishes/dishes/application/suggest/DishByIngredientsSuggester";
import { DishByIngredientsSuggesterGateway } from "../../../dishes/dishes/domain/DishByIngredientsSuggesterGateway";
import { AiSdkMinistral3DishByIngredientsSuggesterGateway } from "../../../dishes/dishes/infraestructure/AiSdkMinistral3DishByIngredientsSuggesterGateway";
import { WeeklyMealPlanMealAssigner } from "../../../dishes/meal-plans/application/assign-meal/WeeklyMealPlanMealAssigner";
import { WeeklyMealPlanCreator } from "../../../dishes/meal-plans/application/create/WeeklyMealPlanCreator";
import { WeeklyMealPlanMealRemover } from "../../../dishes/meal-plans/application/remove-meal/WeeklyMealPlanMealRemover";
import { WeeklyMealPlanMealReplacer } from "../../../dishes/meal-plans/application/replace-meal/WeeklyMealPlanMealReplacer";
import { WeeklyMealPlanSearcher } from "../../../dishes/meal-plans/application/search-by-id/WeeklyMealPlanSearcher";
import { WeeklyMealPlanByWeekStartSearcher } from "../../../dishes/meal-plans/application/search-by-week-start/WeeklyMealPlanByWeekStartSearcher";
import { WeeklyMealPlanShoppingListGenerator } from "../../../dishes/meal-plans/application/shopping-list/WeeklyMealPlanShoppingListGenerator";
import { WeeklyMealPlanRepository } from "../../../dishes/meal-plans/domain/WeeklyMealPlanRepository";
import { PostgresWeeklyMealPlanRepository } from "../../../dishes/meal-plans/infrastructure/PostgresWeeklyMealPlanRepository";
import { EmbeddingsGenerator } from "../../domain/EmbeddingsGenerator";
import { EventBus } from "../../domain/event/EventBus";
import { TransactionManager } from "../../domain/TransactionManager";
import { UuidGenerator } from "../../domain/UuidGenerator";
import { AiSdkEmbeddingsGenerator } from "../AiSdkEmbeddingsGenerator";
import { InMemoryEventBus } from "../domain-event/InMemoryEventBus";
import { NativeUuidGenerator } from "../NativeUuidGenerator";
import { PostgresConnection } from "../postgres/PostgresConnection";
import { PostgresTransactionManager } from "../postgres/PostgresTransactionManager";

const builder = new ContainerBuilder();

// Shared
builder
	.register(PostgresConnection)
	.useFactory(() => {
		return new PostgresConnection(
			"localhost",
			5432,
			"supabase_admin",
			"c0d3ly7v",
			"postgres",
		);
	})
	.asSingleton();

builder.register(UuidGenerator).use(NativeUuidGenerator);
builder
	.register(EmbeddingsGenerator)
	.useFactory(
		() =>
			new AiSdkEmbeddingsGenerator(
				"http://localhost:11434/v1",
				"ollama",
				"qwen3-embedding:0.6b",
			),
	);
builder.registerAndUse(InMemoryEventBus).asSingleton();

builder
	.register(EventBus)
	.useFactory((deps) => deps.get(InMemoryEventBus))
	.asSingleton();
builder.registerAndUse(PostgresTransactionManager);
builder
	.register(TransactionManager)
	.useFactory((deps) => deps.get(PostgresTransactionManager));

// Dishes
builder
	.register(DishByIngredientsSuggesterGateway)
	.useFactory(
		() =>
			new AiSdkMinistral3DishByIngredientsSuggesterGateway(
				"http://localhost:11434/v1",
				"ollama",
			),
	);

builder.registerAndUse(DishByIngredientsSuggester);

// Dishes - CookedDish
builder.register(CookedDishRepository).use(PostgresCookedDishRepository);
builder.registerAndUse(PostgresCookedDishRepository);
builder.registerAndUse(CookedDishCreator);
builder.registerAndUse(AllCookedDishesSearcher);
builder.registerAndUse(CookedDishByIdSearcher);
builder.registerAndUse(CookedDishesSearcher);
builder.registerAndUse(CookedDishesBySimilarIngredientsSearcher);
builder.registerAndUse(CookedDishUpserter);

// Dishes - CookedDish history
builder
	.register(CookedDishAuditRepository)
	.use(PostgresCookedDishAuditRepository);
builder.registerAndUse(PostgresCookedDishAuditRepository);
builder.registerAndUse(CookedDishHistorySearcher);
builder.registerAndUse(CookedDishAuditRecorder).addTag("subscriber");

// WeeklyMealPlan
builder
	.register(WeeklyMealPlanRepository)
	.use(PostgresWeeklyMealPlanRepository);
builder.registerAndUse(PostgresWeeklyMealPlanRepository);
builder.registerAndUse(WeeklyMealPlanCreator);
builder.registerAndUse(WeeklyMealPlanSearcher);
builder.registerAndUse(WeeklyMealPlanByWeekStartSearcher);
builder.registerAndUse(WeeklyMealPlanMealAssigner);
builder.registerAndUse(WeeklyMealPlanMealReplacer);
builder.registerAndUse(WeeklyMealPlanMealRemover);
builder.registerAndUse(WeeklyMealPlanShoppingListGenerator);

// CookedDishRating
builder
	.register(CookedDishRatingRepository)
	.use(PostgresCookedDishRatingRepository);
builder.registerAndUse(PostgresCookedDishRatingRepository);
builder.registerAndUse(CookedDishRatingAdder);
builder.registerAndUse(CookedDishRatingsSummarizer);

export const container = builder.build();
