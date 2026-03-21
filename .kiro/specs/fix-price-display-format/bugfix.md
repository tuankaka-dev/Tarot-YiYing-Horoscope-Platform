# Bugfix Requirements Document

## Introduction

This bugfix addresses the inconsistent and text-heavy price display format across all divination services in the Vietnamese divination application. Currently, service prices are displayed as inline text in parentheses (e.g., "(10 xu)" or "(Miễn phí PRO)"), which lacks visual clarity and professional presentation. The fix will replace this with a more intuitive icon-based display showing the numeric price with a coin icon in a small square box, or "free" for pro plan users.

This change affects all service pricing displays including:
- Tarot card reading options (1, 3, and 5 card spreads)
- I Ching divination casting
- Deep interpretation services

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a non-pro user views service pricing THEN the system displays prices as inline text in parentheses like "(10 xu)"

1.2 WHEN a pro user views service pricing THEN the system displays text in parentheses like "(Miễn phí PRO)"

1.3 WHEN service buttons are rendered THEN the price information is embedded as plain text within the button label without visual distinction

### Expected Behavior (Correct)

2.1 WHEN a non-pro user views service pricing THEN the system SHALL display the numeric price "10" with a small coin icon in a compact square box next to the service name

2.2 WHEN a pro user views service pricing THEN the system SHALL display the text "free" (or Vietnamese equivalent "Miễn phí") instead of the price with icon

2.3 WHEN service buttons are rendered THEN the price information SHALL be visually distinct with an icon-based presentation that clearly separates the price from the service description

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a user clicks a service button THEN the system SHALL CONTINUE TO check user authentication status before proceeding

3.2 WHEN a user clicks a service button THEN the system SHALL CONTINUE TO verify sufficient credits (for non-pro users) before allowing the service

3.3 WHEN a pro user accesses any service THEN the system SHALL CONTINUE TO bypass credit deduction

3.4 WHEN service costs are calculated internally THEN the system SHALL CONTINUE TO use the same pricing logic (10 xu per service)

3.5 WHEN credit deduction occurs THEN the system SHALL CONTINUE TO update the user's credit balance correctly

3.6 WHEN the user profile is fetched THEN the system SHALL CONTINUE TO correctly identify pro vs non-pro users via the is_pro flag
