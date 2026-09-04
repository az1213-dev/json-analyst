# Test Data Fixtures

Sample documents for manual and automated testing of the eight tools (Validate, Format, Repair, Compact, CSV, Chart, Tree, All Tools).

Three groups live here:

- The root of `tests/data/` holds small, valid documents used for everyday smoke testing.
- `broken/` holds documents that are **intentionally invalid**. Every file fails `JSON.parse()`. They exist to exercise the Validate error banner, the Repair tool, and graceful failure paths everywhere else.
- `large/` holds valid but large documents used for performance and layout testing (deep recursion, wide branching, long CSV exports, dense charts).

## broken/ — files that purposely do not work

| File | Lines | Fault it exercises |
| --- | --- | --- |
| `trailing-comma.json` | 14 | Trailing commas in an array and an object. Repair should fix this. |
| `single-quotes.json` | 11 | Single-quoted keys and string values. Repair should fix this. |
| `unquoted-keys.json` | 12 | Bare identifiers as object keys (JavaScript object literal style). |
| `missing-comma.json` | 10 | Two separate places where a comma between properties is missing. |
| `unclosed-brace.json` | 14 | Document ends before its braces are balanced. |
| `mismatched-brackets.json` | 10 | An array closed with `}` and an object closed with `]`. |
| `with-comments.json` | 13 | JSONC line and block comments, which strict JSON forbids. |
| `python-literals.json` | 11 | `True` / `False` / `None` and a parenthesised tuple instead of an array. |
| `nan-infinity.json` | 12 | `NaN`, `Infinity`, leading `+`, a bare `.75`, a truncated exponent, and hex `0x1F`. |
| `bad-escapes.json` | 9 | Unescaped Windows backslashes, a short `\u` sequence, an unknown escape, a raw newline inside a string, and an unterminated string. |
| `truncated-stream.json` | 8 | A response cut off mid-token, as when a download is interrupted. |
| `multiple-roots.json` | 4 | Newline-delimited JSON (three root values), which is not a single JSON document. |
| `not-json.json` | 12 | A SQL dump with a `.json` extension — wrong content type entirely. |
| `empty.json` | 1 | An effectively empty file (whitespace only). |
| `bom-and-smart-quotes.json` | 6 | A UTF-8 byte-order mark plus typographic quotation marks copied from a word processor. |
| `large-broken-inventory.json` | 1,208 | Valid for hundreds of lines, then breaks at line 645 (unquoted key), with two further faults later on. Useful for checking that error reporting points at the right line in a big file rather than the top. |

## large/ — valid documents for load testing

| File | Lines | Size | What it stresses |
| --- | --- | --- | --- |
| `large-events.json` | 120,003 | ~2.6 MB | A flat array of 10,000 uniform records. Best case for CSV export and archetype inference. |
| `mixed-catalog.json` | 88,571 | ~1.9 MB | 1,500 products with nested variants and reviews, mixed types, unicode text, and numeric extremes (`MAX_SAFE_INTEGER`, `5e-324`, empty string/object/array, `null`). |
| `large-users.json` | 67,500 | ~1.6 MB | 2,000 user records four levels deep. General-purpose Tree and Chart workload. |
| `wide-object.json` | 30,006 | ~585 KB | One object with 5,000 sibling keys. Stresses branching-factor metrics and horizontal chart layout. |
| `deep-nested.json` | 2,010 | ~515 KB | 250 levels of nesting. Stresses recursive traversal, breadcrumb depth, and stack safety. |

All `large/` files stay under the 5 MB browser upload limit so they can be loaded through the file picker as well as read from disk.

## Regenerating

The `large/` files and `broken/large-broken-inventory.json` are generated from a seeded pseudo-random source, so regenerating produces byte-identical output. The other fixtures are hand-written and should be edited directly.
