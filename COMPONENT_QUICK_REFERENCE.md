> [!NOTE]
> This document is archived context. For setup, run, and operational instructions, use INSTRUCTION_MANUAL.md.

# Quick Reference Guide - UI Component Usage

## Quick Import

```javascript
import {
  Button,
  Card, CardHeader, CardBody, CardFooter, CardImage,
  Input, TextArea, Select,
  Spinner, SkeletonLoader, SkeletonCard, SkeletonText,
  Alert, AlertGroup, ErrorBoundary,
  RecommendationCard, RecommendationCarousel, RecommendationRow,
  StatCard, AnalyticsChart, RevenueChart, PaymentBreakdown, VendorRanking, AnalyticsDashboard
} from './components/UI';
```

---

## Components at a Glance

### 1. Button

```jsx
// Basic
<Button>Click me</Button>

// Variants: primary, secondary, outline, ghost, danger, success
<Button variant="primary">Save</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Delete</Button>

// Sizes: sm, md (default), lg
<Button size="lg">Large Button</Button>

// States
<Button disabled>Disabled</Button>
<Button loading>Processing...</Button>

// Full width
<Button fullWidth>Full Width</Button>

// With icon (pass any React component)
<Button icon={SaveIcon}>Save Changes</Button>
```

### 2. Card

```jsx
// Simple card
<Card>Content here</Card>

// With composable sections
<Card>
  <CardImage src="/image.jpg" alt="description" />
  <CardHeader>Title</CardHeader>
  <CardBody>Content</CardBody>
  <CardFooter>Footer content</CardFooter>
</Card>

// No hover effect
<Card hoverable={false}>Content</Card>

// Compact padding
<Card compact>Content</Card>

// With click handler
<Card onClick={handleClick}>Clickable card</Card>
```

### 3. Input Components

```jsx
// Text input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={error?.email}
  hint="We'll never share your email"
  required
/>

// Text area
<TextArea
  label="Message"
  placeholder="Type your message..."
  value={message}
  onChange={(e) => setMessage(e.target.value)}
  rows={5}
/>

// Select dropdown
<Select
  label="Category"
  options={[
    { value: 'pizza', label: 'Pizza' },
    { value: 'burger', label: 'Burger' }
  ]}
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
/>
```

### 4. Loading States

```jsx
// Spinner
<Spinner />                    // Default md size
<Spinner size="sm" />          // Small spinner
<Spinner size="lg" />          // Large spinner
<Spinner fullScreen />         // Full screen overlay

// Skeleton loaders
<SkeletonLoader />             // 3 text skeletons (default)
<SkeletonLoader count={5} />   // 5 skeletons
<SkeletonLoader type="card" /> // Card skeleton
<SkeletonCard />               // Pre-made card skeleton
<SkeletonText lines={5} />     // Multi-line text skeleton

// Usage pattern
{loading ? <Spinner size="lg" /> : <Content />}
```

### 5. Alert Components

```jsx
// Individual alerts
<Alert type="success" message="Order placed!" />
<Alert type="error" message="Something went wrong" />
<Alert type="warning" message="Are you sure?" />
<Alert type="info" message="For your information" />

// Dismissable
<Alert
  type="error"
  message="Failed to save"
  onClose={handleDismiss}
/>

// With icon
<Alert type="error" message="Error" icon={ErrorIcon} />

// Alert group
<AlertGroup
  alerts={[
    { type: 'error', message: 'Error 1' },
    { type: 'success', message: 'Success!' }
  ]}
  onClose={(index) => removeAlert(index)}
/>

// Error boundary
<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

### 6. Recommendation Components

```jsx
// Single recommendation card
<RecommendationCard
  item={{
    name: 'Margherita Pizza',
    price: 12.99,
    rating: 4.8,
    image: '/pizza.jpg',
    description: 'Classic Italian pizza'
  }}
  vendor={{ name: 'Pizza Palace' }}
  method="trending"        // collaborative, content, item-based, trending, hybrid
  score={0.95}             // 0-1 confidence score
  onAddToCart={() => console.log('add')}
  onView={() => console.log('view')}
/>

// Multiple items carousel
<RecommendationCarousel
  recommendations={items}
  loading={false}
  onAddToCart={handleAdd}
  onView={handleView}
/>

// Compact row view
<RecommendationRow
  recommendation={item}
  onAddToCart={handleAdd}
  onView={handleView}
/>
```

### 7. Analytics Components

```jsx
// Single metric card
<StatCard
  label="Total Revenue"
  value="$12,500"
  change={15}              // % change
  trend="up"               // up or down
  icon="💰"
/>

// Chart visualization
<AnalyticsChart
  title="Orders by Day"
  data={[
    { label: 'Mon', value: 120 },
    { label: 'Tue', value: 150 }
  ]}
  type="bar"               // bar or line
  height={300}
  showLegend={true}
/>

// Pre-configured revenue chart
<RevenueChart data={revenueData} />

// Payment breakdown
<PaymentBreakdown
  methods={{
    card: { count: 100, amount: 5000 },
    khalti: { count: 50, amount: 2000 }
  }}
/>

// Vendor rankings
<VendorRanking
  vendors={[
    { name: 'Pizza Palace', orders: 450, revenue: 12500, rating: 4.8 }
  ]}
/>

// Complete dashboard
<AnalyticsDashboard
  data={{
    orderStats: { ... },
    revenueData: [ ... ],
    paymentMethods: { ... },
    topVendors: [ ... ]
  }}
/>
```

---

## Layout Classes

### Containers
```jsx
<div className="container">
  {/* Max-width wrapper with responsive padding */}
</div>
```

### Flexbox
```jsx
<div className="flex">                    {/* display: flex */}
<div className="flex-col">               {/* flex-direction: column */}
<div className="flex-between">           {/* space-between + center */}
<div className="flex-center">            {/* justify-center + align-center */}
<div className="gap-lg">                 {/* gap: var(--space-lg) */}
```

### Grid
```jsx
<div className="grid">                   {/* display: grid, gap: var(--space-lg) */}
<div className="grid-2">                 {/* 2 columns */}
<div className="grid-3">                 {/* 3 columns */}
<div className="grid-4">                 {/* 4 columns */}
{/* Auto-responsive on mobile */}
```

### Spacing
```jsx
<div className="p-md">                   {/* padding: var(--space-md) */}
<div className="p-lg">                   {/* padding: var(--space-lg) */}
<div className="m-auto">                 {/* margin: auto */}
<div className="mx-auto">                {/* margin: 0 auto */}
<div className="mt-md">                  {/* margin-top: var(--space-md) */}
```

### Text Utilities
```jsx
<div className="text-center">           {/* text-align: center */}
<div className="text-sm">                {/* font-size: var(--font-size-sm) */}
<div className="text-bold">              {/* font-weight: bold */}
<div className="text-muted">             {/* color: var(--text-secondary) */}
```

---

## Badges

```jsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>
```

---

## Forms Pattern

```jsx
const [formData, setFormData] = useState({
  email: '',
  password: '',
  category: ''
});
const [errors, setErrors] = useState({});

<div>
  <Input
    label="Email"
    type="email"
    value={formData.email}
    onChange={(e) => setFormData({...formData, email: e.target.value})}
    error={errors.email}
    required
  />
  
  <Input
    label="Password"
    type="password"
    value={formData.password}
    onChange={(e) => setFormData({...formData, password: e.target.value})}
    error={errors.password}
    required
  />
  
  <Select
    label="Category"
    options={categories}
    value={formData.category}
    onChange={(e) => setFormData({...formData, category: e.target.value})}
  />
  
  <Button variant="primary" onClick={handleSubmit}>
    Submit
  </Button>
</div>
```

---

## Animations Usage

```jsx
// Automatic on page load
<div className="animate-fade">            {/* Fade in */}
<div className="animate-slide-up">        {/* Slide up */}
<div className="animate-slide-down">      {/* Slide down */}

// Staggered animation (repeat pattern)
{items.map((item, i) => (
  <div 
    key={i}
    className="animate-slide-up"
    style={{ animationDelay: `${i * 0.1}s` }}
  >
    {item}
  </div>
))}
```

---

## Color Usage

### In Classes
```css
.button { background: var(--color-primary); }
.alert { color: var(--color-danger); }
.badge { background: var(--border-light); }
```

### Direct CSS Variables
```jsx
<div style={{
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  borderColor: 'var(--border-light)'
}}>
```

### Predefined Classes
```jsx
<p className="text-muted">Gray text</p>           {/* --text-secondary */}
<div className="bg-secondary">Light background</div>  {/* --bg-secondary */}
```

---

## Common Patterns

### Modal/Overlay
```jsx
<div className="modal-overlay" onClick={handleClose}>
  <div className="modal" onClick={e => e.stopPropagation()}>
    <h2>Modal Title</h2>
    <p>Content</p>
    <footer className="card-footer">
      <Button onClick={handleClose}>Close</Button>
    </footer>
  </div>
</div>
```

### Form Section (Checkout pattern)
```jsx
<div className="form-section">
  <div className="form-section-title">Section Title</div>
  <Input label="Field 1" />
  <Input label="Field 2" />
  <Button fullWidth>Continue</Button>
</div>
```

### Item Grid
```jsx
<div className="grid grid-3">
  {items.map(item => (
    <Card key={item.id}>
      <CardImage src={item.image} />
      <CardBody>
        <h3>{item.name}</h3>
        <p>{item.description}</p>
      </CardBody>
    </Card>
  ))}
</div>
```

### Table
```jsx
<table>
  <thead>
    <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {rows.map(row => (
      <tr key={row.id}>
        <td>{row.name}</td>
        <td>{row.email}</td>
        <td><Button size="sm">Edit</Button></td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Responsive Patterns

### Mobile-First Grid
```jsx
<div className="grid">              {/* 1 col by default */}
  {/* On mobile: 1 col (auto) */}
  {/* On tablet (>768px): 2-3 cols via grid-2/grid-3 */}
  {/* On desktop (>1024px): 4 cols via grid-4 */}
</div>
```

### Conditional Classes
```jsx
<div className={`
  card
  ${hoverable ? '' : 'card-no-hover'}
  ${compact ? 'card-compact' : ''}
`}>
```

### Hide/Show by Breakpoint
```jsx
<nav className="hide-mobile">Desktop nav</nav>      {/* Hidden < 768px */}
<nav className="show-mobile">Mobile nav</nav>       {/* Hidden > 768px */}
```

---

## Best Practices

### 1. Always Import from UI Index
```javascript
// ✅ Good
import { Button, Card } from './components/UI';

// ❌ Avoid
import Button from './components/UI/Button';
```

### 2. Use CSS Variables in Custom Styles
```jsx
// ✅ Good
style={{ color: 'var(--color-primary)' }}

// ❌ Avoid
style={{ color: '#ff6b35' }}
```

### 3. Responsive Classes First
```jsx
// ✅ Good - add responsive class on container
<div className="grid grid-3">

// ❌ Avoid - inline media queries
style={{ display: 'grid', gridTemplateColumns: ... }}
```

### 4. Use Existing Animations
```jsx
// ✅ Good
<div className="animate-slide-up">

// ❌ Avoid  
<div style={{ animation: 'slideInUp 250ms ease-in-out' }}>
```

### 5. Leverage Button Variants
```jsx
// ✅ Good
<Button variant="primary">Primary</Button>
<Button variant="danger">Delete</Button>

// ❌ Avoid
<button style={{ background: '#ff6b35' }}>Custom</button>
```

---

## Debugging Tips

### Check Design Tokens
```css
/* Open DevTools Console */
getComputedStyle(document.documentElement).getPropertyValue('--color-primary')
```

### Dark Mode Testing
```javascript
// In browser console
matchMedia('(prefers-color-scheme: dark)').matches
```

### Responsive Testing
```
Chrome DevTools → Toggle Device Toolbar → Select device
Or use F12 → Ctrl+Shift+M (Windows) / Cmd+Shift+M (Mac)
```

### Animation Performance
```
Chrome DevTools → Performance → Record → Play animation
Watch FPS (should be 60fps, not dropping)
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Button not styling | Check `className` not `class` |
| Input not focusing | Wrap with FormGroup, check z-index |
| Card not hovering | Ensure hoverable={true} (default) |
| Loading spinner invisible | Check color contrast with background |
| Dark mode not working | Clear browser cache, check system preference |
| Grid not stacking mobile | Add `grid-2` or `grid-3`, check viewport meta tag |
| Animation jumpy | Check `will-change` in DevTools, reduce motion setting |

---

## Performance Checklist

- [ ] Use `React.memo()` for frequently re-rendered components
- [ ] Lazy load heavy components with `React.lazy()`
- [ ] Optimize images (use WebP, compress, lazy load)
- [ ] Minimize animations on low-end devices (check `prefers-reduced-motion`)
- [ ] Code split pages by route
- [ ] Cache API responses appropriately
- [ ] Use CSS animations over JS (better performance)

---

## Resources

- **Colors**: CSS variables in `src/index.css` (lines 1-30)
- **Typography**: CSS variables in `src/index.css` (lines 40-60)
- **Animations**: Keyframes in `src/index.css` (lines 120-180)
- **Global Utils**: Utility classes in `src/App.css`
- **Components**: JSX components in `src/components/UI/`
- **Pages**: Full-page examples in `src/pages/`

---

**Last Updated**: Phase 4 Complete
**Maintainer**: Development Team
**Version**: 1.0
