module.exports = {
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    root: true,
    rules: {
        '@typescript-eslint/no-explicit-any': [0],
        '@typescript-eslint/ban-types': [0],
        'quotes': [2, 'single', { 'avoidEscape': false, 'allowTemplateLiterals': true }],
        'template-curly-spacing': [ 'error', 'never' ],
        'object-curly-spacing': [ 'error', 'always' ]
    },
    ignorePatterns: ['lib/**', '**.cjs']
};
