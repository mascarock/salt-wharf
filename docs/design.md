# Salt Wharf Design Notes

Salt Wharf treats a posted call sheet as a notice on a theatre callboard. A later posted notice can replace an earlier posted notice without deleting it.

## Later Sheet Wins

```mermaid
flowchart LR
  A[callSheet-oct4-v1<br/>posted<br/>Rosa: Mara Camilleri]
  B[callSheet-oct4-v2<br/>posted<br/>Rosa: Lina Borg]
  D[Public door<br/>4 October 2026]

  B -- supersedes --> A
  B -- stands because no posted sheet supersedes it --> D
  A -- remains in the book but loses --> D
```

For one performance date, the door looks at posted sheets only. If a posted sheet is named by another posted sheet's `supersedes` reference, it is still part of the record but it is not the standing sheet.

## Coverage Computation

```mermaid
flowchart TD
  P[Person, role, night, standing call sheet]
  R{Range contains role range?}
  S{Skills cover role skills?}
  C{Free from concurrent scenes?}
  U{Available that night?}
  O{Covering fewer than two other roles?}
  Y[Can cover]
  N[Cannot cover<br/>print first failed predicate]

  P --> R
  R -- no --> N
  R -- yes --> S
  S -- no --> N
  S -- yes --> C
  C -- no --> N
  C -- yes --> U
  U -- no --> N
  U -- yes --> O
  O -- no --> N
  O -- yes --> Y
```

Coverage is computed from the company data each time. It is not a stored understudy list.
