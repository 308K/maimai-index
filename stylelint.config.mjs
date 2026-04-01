/** @type {import('stylelint').Config} */
export default {
    extends: ["stylelint-config-standard"],
    rules: {
        "at-rule-no-unknown": [
            true,
            {
                ignoreAtRules: ["tailwind", "layer", "apply", "config", "screen", "variants", "responsive"]
            }
        ]
    }
};