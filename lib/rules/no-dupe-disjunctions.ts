import type { RegExpVisitor } from "regexpp/visitor"
import type {
    CapturingGroup,
    Group,
    LookaroundAssertion,
    Pattern,
    Quantifier,
} from "regexpp/ast"
import type { RegExpContext } from "../utils"
import { createRule, defineRegexpVisitor } from "../utils"
import { isCoveredNode, isEqualNodes } from "../utils/regexp-ast"

export default createRule("no-dupe-disjunctions", {
    meta: {
        docs: {
            description: "disallow duplicate disjunctions",
            // TODO In the major version
            // recommended: true,
            recommended: false,
        },
        schema: [
            {
                type: "object",
                properties: {
                    disallowNeverMatch: { type: "boolean" },
                },
                additionalProperties: false,
            },
        ],
        messages: {
            duplicated: "The disjunctions are duplicated.",
            neverExecute:
                "This disjunction can never match. Its condition is covered by previous conditions in the disjunctions.",
        },
        type: "suggestion", // "problem",
    },
    create(context) {
        const disallowNeverMatch = Boolean(
            context.options[0]?.disallowNeverMatch,
        )

        /**
         * Check has after pattern
         */
        function hasAfterPattern(
            node: Group | CapturingGroup | Pattern | LookaroundAssertion,
        ): boolean {
            if (node.type === "Assertion") {
                return false
            }
            if (node.type === "Pattern") {
                return false
            }
            let target: Group | CapturingGroup | Quantifier = node
            let parent = target.parent
            while (parent) {
                if (parent.type === "Alternative") {
                    const index = parent.elements.indexOf(target)
                    if (index < parent.elements.length - 1) {
                        return true
                    }
                    return hasAfterPattern(parent.parent)
                }
                if (parent.type === "Quantifier") {
                    target = parent
                    parent = target.parent
                    continue
                }
                return false
            }
            return false
        }

        /**
         * Create visitor
         */
        function createVisitor({
            node,
            flags,
            toCharSet,
            getRegexpLocation,
        }: RegExpContext): RegExpVisitor.Handlers {
            /** Verify group node */
            function verify(
                regexpNode:
                    | Group
                    | CapturingGroup
                    | Pattern
                    | LookaroundAssertion,
            ) {
                const canOmitRight =
                    disallowNeverMatch && !hasAfterPattern(regexpNode)
                const leftAlts = []
                for (const alt of regexpNode.alternatives) {
                    const dupeAlt = disallowNeverMatch
                        ? leftAlts.find((leftAlt) =>
                              isCoveredNode(leftAlt, alt, {
                                  flags,
                                  canOmitRight,
                                  toCharSet,
                              }),
                          )
                        : leftAlts.find((leftAlt) =>
                              isEqualNodes(leftAlt, alt, toCharSet, (a, _b) => {
                                  if (a.type === "CapturingGroup") {
                                      return false
                                  }
                                  return null
                              }),
                          )
                    if (dupeAlt) {
                        context.report({
                            node,
                            loc: getRegexpLocation(alt),
                            messageId:
                                disallowNeverMatch &&
                                !isEqualNodes(dupeAlt, alt, toCharSet)
                                    ? "neverExecute"
                                    : "duplicated",
                        })
                        continue
                    }

                    leftAlts.push(alt)
                }
            }

            return {
                onPatternEnter: verify,
                onGroupEnter: verify,
                onCapturingGroupEnter: verify,
                onAssertionEnter(aNode) {
                    if (
                        aNode.kind === "lookahead" ||
                        aNode.kind === "lookbehind"
                    ) {
                        verify(aNode)
                    }
                },
            }
        }

        return defineRegexpVisitor(context, {
            createVisitor,
        })
    },
})
