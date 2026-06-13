# Example Prompts

These examples demonstrate what Prompt Compressor targets and what it preserves.

---

## Example 1 — Verbose Technical Request

**Before (71 tokens):**
```
Hello! I hope this message finds you well. I was wondering if you could possibly help me
to understand, if you have a moment, the fundamental concepts behind how transformer neural
networks actually work in practice. I would really appreciate it if you could basically
explain the main ideas in a way that is easy to understand. Thank you so much in advance
for your time and assistance!
```

**After (~28 tokens):**
```
explain the main concepts behind how transformer neural networks work in practice in a way
that is easy to understand.
```

**Reduction: ~61%**

---

## Example 2 — Legal Constraint Prompt (negations preserved)

**Before (68 tokens):**
```
I would like you to please help me draft a clause for a software contract. It is really
important that you include language stating that the vendor cannot and must not access user
data without explicit written consent. The vendor should never store passwords in plain text,
and must not retain any data beyond 30 days after contract termination.
```

**After (~48 tokens):**
```
Help me draft a clause for a software contract. Include language stating that the vendor
cannot and must not access user data without explicit written consent. The vendor should
never store passwords in plain text, and must not retain any data beyond 30 days after
contract termination.
```

**Note:** "cannot", "must not", "never" are all preserved exactly.

---

## Example 3 — Business Email Request

**Before (55 tokens):**
```
Hi there! I was hoping you could perhaps kindly help me draft an email to my team. What I
am essentially looking for is a brief summary of the fact that our meeting has been moved
from Tuesday to Thursday due to the fact that a significant number of team members have
conflicts on that particular day.
```

**After (~26 tokens):**
```
Draft an email to my team: our meeting has been moved from Tuesday to Thursday because many
team members have conflicts.
```

**Reduction: ~53%**
