# 03 — Admin: Coming Soon Toggle

> Read [`HANDOFF.md`](../../HANDOFF.md) §1–§3 first.

## Goal

The platforms table now has a `coming_soon` boolean column and the public site renders Coming Soon tiles based on it. The admin panel doesn't yet have a UI toggle to flip this. Add one so admins don't have to drop into Neon to manage state.

## Tasks

### 1. Add the toggle to the platform edit form

In `client/src/components/admin-panel.tsx`, locate the platform edit form (search for `insertPlatformSchema` and the form around it).

Add a `Switch` + `Label` for `comingSoon` next to the existing `isActive` toggle. The form already derives from `insertPlatformSchema` (which now includes `comingSoon` automatically via Drizzle), so wiring is the same pattern as `isActive`:

```tsx
<FormField
  control={form.control}
  name="comingSoon"
  render={({ field }) => (
    <FormItem className="flex items-center justify-between rounded-lg border p-4">
      <div className="space-y-0.5">
        <FormLabel>Coming Soon</FormLabel>
        <FormDescription>
          Show this platform with a "Coming Soon" badge instead of a Launch link.
        </FormDescription>
      </div>
      <FormControl>
        <Switch
          checked={field.value ?? false}
          onCheckedChange={field.onChange}
          data-testid={`switch-platform-coming-soon`}
        />
      </FormControl>
    </FormItem>
  )}
/>
```

Make sure the form's default values include `comingSoon: false` for new platforms, and that existing platforms load their `comingSoon` value when the form is opened for editing.

### 2. Show the Coming Soon state in the admin platform list

In the same file, find the platform list view (a table or cards listing all platforms). Add a small badge next to the name when `platform.comingSoon === true`:

```tsx
{platform.comingSoon && (
  <Badge variant="secondary" className="ml-2">
    <Clock className="h-3 w-3 mr-1" />
    Coming Soon
  </Badge>
)}
```

(Import `Clock` from `lucide-react` if not present.)

### 3. Don't let admins accidentally orphan a platform

Optional UX improvement: if `comingSoon` is true, you may want to gray out or hint that the `link` field is shown but won't be used by the public site. Not critical — the column still gets persisted, just unused while comingSoon is on.

## Acceptance

- [ ] Editing an existing platform shows its current Coming Soon state.
- [ ] Toggling and saving persists the change.
- [ ] After save, the public site (`/platforms` section) reflects the new state on next page load.
- [ ] Creating a new platform defaults Coming Soon to off.
- [ ] The admin platform list shows a Coming Soon badge for platforms in that state.
- [ ] `npm run check` passes.
