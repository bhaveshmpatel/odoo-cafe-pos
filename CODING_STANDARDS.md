# Coding Standards & Best Practices

To maintain velocity and prevent "spaghetti code" during the hackathon, all code contributed to this repository must adhere to the following standards. Readability and predictability are our highest priorities.

## 1. Naming Conventions

* **Variables & Functions:** Use `camelCase`. Names must be highly descriptive. 
  * *Bad:* `const tId = 5;`
  * *Good:* `const currentTableId = 5;`
* **React Components:** Use `PascalCase` for both the file name and the component name. (e.g., `OrderSummary.tsx`, `DiscountModal.tsx`).
* **Database Models (Prisma):** Use `PascalCase` for model names and `snake_case` for database fields. (e.g., `model DiningTable { table_number Int }`).
* **Booleans:** Prefix boolean variables with `is`, `has`, or `should`. (e.g., `isActive`, `hasUnsavedChanges`).

## 2. React & Component Architecture (`apps/web`)

* **Keep Components Small:** No component should exceed 150-200 lines of code. If `OrderView.tsx` gets too long, extract the UI into `CartSection.tsx` and `PaymentSection.tsx`.
* **No Prop Drilling:** Do not pass props down more than two levels. If deeply nested components need data (like the current cart state), they must read it directly from the Zustand store.
* **Destructure Props:** Always destructure props in the function signature for cleaner code.
  * *Bad:* `function TicketCard(props: { ticket: Order })`
  * *Good:* `function TicketCard({ ticket }: { ticket: Order })`

## 3. Backend & API Rules (`apps/api`)

* **Standardized JSON Responses:** Every REST API endpoint must return a predictable format so the frontend never has to guess how to parse the data.
  ```typescript
  // Success Response
  res.status(200).json({ success: true, data: { ... } });
  
  // Error Response
  res.status(400).json({ success: false, error: "Invalid coupon code." });

* **Graceful Error Handling:** Never let the Node.js server crash. Wrap all asynchronous controller functions in `try/catch` blocks.
* **Fat Utilities, Skinny Controllers:** Complex business logic (like the promotional discount math) belongs in `src/utils/pricingEngine.ts`, not stuffed directly inside the Express route handler.

## 4. State Management (Zustand)

* **Update State Safely:** Always use the functional update pattern when modifying arrays or objects in the global store to prevent stale closures.
```typescript
// Good: Modifying the cart safely
// addToCart: (item) => set((state) => ({ cart: [...state.cart, item] }))


## 5. Comments & Documentation

* **Self-Documenting Code First:** Rely on excellent variable names rather than writing comments explaining *what* the code does.
* **Comment the "Why":** Only write inline comments to explain *why* you did something unusual or complex.
* **TSDoc for Utilities:** Any shared utility function (especially in `packages/shared-types` or backend math logic) must have a brief TSDoc comment explaining its inputs and outputs.
```typescript
/**
 * Evaluates order total and applies automated promotions.
 * @param cartItems - Array of active items in the cart
 * @returns The final discounted total
 */

```



## 6. Tailwind CSS Guidelines

* **Group Utility Classes:** Keep your class strings organized mentally: Layout (`flex`, `grid`) -> Spacing (`p-4`, `m-2`) -> Typography (`text-lg`, `font-bold`) -> Colors (`bg-blue-500`).
* **Limit Inline Styles:** Only use React `style={{}}` attributes for dynamic, data-driven values that Tailwind cannot handle easily (e.g., rendering the dynamic Category Color assigned by the Admin).

```

Are you ready to move on to the `.gitignore` and `.env.example` configurations to lock down your security and build outputs?

```