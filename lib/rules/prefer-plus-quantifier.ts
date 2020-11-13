import type { Expression } from "estree"
import type { RegExpVisitor } from "regexpp/visitor"
import {
    createRule,
    defineRegexpVisitor,
    getRegexpLocation,
    getRegexpRange,
    getQuantifierOffsets,
} from "../utils"

export default createRule("prefer-plus-quantifier", {
    meta: {
        docs: {
            description: "enforce using `+` quantifier",
            recommended: true,
        },
        fixable: "code",
        schema: [],
        messages: {
            unexpected: 'Unexpected quantifier "{{expr}}". Use "+" instead.',
        },
        type: "suggestion", // "problem",
    },
    create(context) {
        const sourceCode = context.getSourceCode()

        /**
         * Create visitor
         * @param node
         */
        function createVisitor(node: Expression): RegExpVisitor.Handlers {
            return {
                onQuantifierEnter(qNode) {
                    if (qNode.min === 1 && qNode.max === Infinity) {
                        const [startOffset, endOffset] = getQuantifierOffsets(
                            qNode,
                        )
                        const text = qNode.raw.slice(startOffset, endOffset)
                        if (text !== "+") {
                            context.report({
                                node,
                                loc: getRegexpLocation(
                                    sourceCode,
                                    node,
                                    qNode,
                                    [startOffset, endOffset],
                                ),
                                messageId: "unexpected",
                                data: {
                                    expr: text,
                                },
                                fix(fixer) {
                                    const range = getRegexpRange(
                                        sourceCode,
                                        node,
                                        qNode,
                                    )
                                    if (range == null) {
                                        return null
                                    }
                                    return fixer.replaceTextRange(
                                        [
                                            range[0] + startOffset,
                                            range[0] + endOffset,
                                        ],
                                        "+",
                                    )
                                },
                            })
                        }
                    }
                },
            }
        }

        return defineRegexpVisitor(context, {
            createVisitor,
        })
    },
})