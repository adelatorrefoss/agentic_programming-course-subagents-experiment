/** @jest-environment jsdom */

import "@testing-library/jest-dom";

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import CookedDishDetail from "../../../src/app/cooked-dishes/[id]/page";

jest.mock("next/navigation", () => ({
	useParams: () => ({ id: "dish-1" }),
}));

jest.mock(
	"../../../src/app/cooked-dishes/[id]/CookedDishHistory",
	() => ({ CookedDishHistory: () => null }),
);

const mockFetch = jest.fn();
global.fetch = mockFetch;

function dishResponse(overrides?: Partial<{ name: string; description: string }>) {
	return {
		ok: true,
		json: () =>
			Promise.resolve({
				id: "dish-1",
				name: "Tomato Soup",
				description: "A classic soup",
				ingredients: [
					{ name: "Tomato", type: "main" },
					{ name: "Salt", type: "household_staple" },
				],
				...overrides,
			}),
	};
}

function ratingsResponse() {
	return {
		ok: true,
		json: () =>
			Promise.resolve({
				average: 4,
				total: 2,
				distribution: { 1: 0, 2: 0, 3: 0, 4: 2, 5: 0 },
			}),
	};
}

async function renderDetailPage() {
	mockFetch
		.mockResolvedValueOnce(dishResponse())
		.mockResolvedValueOnce(ratingsResponse());

	render(<CookedDishDetail />);

	await waitFor(() => expect(screen.getByText("Tomato Soup")).toBeInTheDocument());
}

beforeEach(() => {
	jest.clearAllMocks();
});

describe("Edit dish should", () => {
	it("show an edit button on the dish detail page", async () => {
		await renderDetailPage();

		expect(screen.getByRole("button", { name: /edit dish/i })).toBeInTheDocument();
	});

	it("open the edit form prefilled with current dish data when edit is clicked", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		expect(screen.getByDisplayValue("Tomato Soup")).toBeInTheDocument();
		expect(screen.getByDisplayValue("A classic soup")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Tomato")).toBeInTheDocument();
		expect(screen.getByDisplayValue("Salt")).toBeInTheDocument();
	});

	it("restores original dish data and closes form when cancel is clicked", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		const nameInput = screen.getByDisplayValue("Tomato Soup");
		fireEvent.change(nameInput, { target: { value: "Changed Name" } });

		fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

		expect(screen.getByText("Tomato Soup")).toBeInTheDocument();
		expect(screen.queryByRole("form", { name: /edit dish/i })).not.toBeInTheDocument();
	});

	it("rejects empty dish name with a validation message and does not call the API", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		const nameInput = screen.getByDisplayValue("Tomato Soup");
		fireEvent.change(nameInput, { target: { value: "" } });

		const authorInput = screen.getByPlaceholderText(/required to save changes/i);
		fireEvent.change(authorInput, { target: { value: "Chef Ada" } });

		fireEvent.submit(screen.getByRole("form", { name: /edit dish/i }));

		expect(await screen.findByRole("alert")).toHaveTextContent(/name is required/i);
		expect(mockFetch).not.toHaveBeenCalledWith(
			expect.stringContaining("dish-1"),
			expect.objectContaining({ method: "PUT" }),
		);
	});

	it("rejects missing author name with a validation message", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		// name and ingredients are prefilled; only author is left empty
		fireEvent.submit(screen.getByRole("form", { name: /edit dish/i }));

		expect(await screen.findByRole("alert")).toHaveTextContent(/your name is required/i);
	});

	it("calls PUT with updated data and correct author header when saved", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		const nameInput = screen.getByDisplayValue("Tomato Soup");
		fireEvent.change(nameInput, { target: { value: "Updated Soup" } });

		const authorInput = screen.getByPlaceholderText(/required to save changes/i);
		fireEvent.change(authorInput, { target: { value: "Chef Ada" } });

		mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: "updated" }) });

		fireEvent.submit(screen.getByRole("form", { name: /edit dish/i }));

		await waitFor(() =>
			expect(mockFetch).toHaveBeenCalledWith(
				"/api/cooked-dishes/dish-1",
				expect.objectContaining({
					method: "PUT",
					headers: expect.objectContaining({ "X-Actor-Id": "Chef Ada" }),
				}),
			),
		);
	});

	it("reflects saved changes in the UI and shows success message after save", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		const nameInput = screen.getByDisplayValue("Tomato Soup");
		fireEvent.change(nameInput, { target: { value: "Updated Soup" } });

		const authorInput = screen.getByPlaceholderText(/required to save changes/i);
		fireEvent.change(authorInput, { target: { value: "Chef Ada" } });

		mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ status: "updated" }) });

		fireEvent.submit(screen.getByRole("form", { name: /edit dish/i }));

		await waitFor(() =>
			expect(screen.getByText("Updated Soup")).toBeInTheDocument(),
		);
		expect(screen.queryByRole("form", { name: /edit dish/i })).not.toBeInTheDocument();
		expect(screen.getByRole("status")).toHaveTextContent(/saved successfully/i);
	});

	it("shows an error alert and keeps form open when the save request fails", async () => {
		await renderDetailPage();

		fireEvent.click(screen.getByRole("button", { name: /edit dish/i }));

		const authorInput = screen.getByPlaceholderText(/required to save changes/i);
		fireEvent.change(authorInput, { target: { value: "Chef Ada" } });

		mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

		fireEvent.submit(screen.getByRole("form", { name: /edit dish/i }));

		expect(await screen.findByRole("alert")).toHaveTextContent(/could not save/i);
		expect(screen.getByRole("form", { name: /edit dish/i })).toBeInTheDocument();
	});
});

