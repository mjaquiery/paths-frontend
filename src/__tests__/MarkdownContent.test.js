"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var vitest_1 = require("vitest");
var test_utils_1 = require("@vue/test-utils");
var vue_query_1 = require("@tanstack/vue-query");
var MarkdownContent_vue_1 = require("../components/MarkdownContent.vue");
function createWrapper(content) {
    var queryClient = new vue_query_1.QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return (0, test_utils_1.mount)(MarkdownContent_vue_1.default, {
        props: { content: content },
        global: {
            plugins: [[vue_query_1.VueQueryPlugin, { queryClient: queryClient }]],
        },
    });
}
(0, vitest_1.describe)('MarkdownContent', function () {
    (0, vitest_1.it)('renders plain text as a paragraph', function () {
        var wrapper = createWrapper('Hello world');
        (0, vitest_1.expect)(wrapper.find('.markdown-content').html()).toContain('Hello world');
    });
    (0, vitest_1.it)('renders bold markdown', function () {
        var wrapper = createWrapper('**bold text**');
        (0, vitest_1.expect)(wrapper.find('strong').exists()).toBe(true);
        (0, vitest_1.expect)(wrapper.find('strong').text()).toBe('bold text');
    });
    (0, vitest_1.it)('renders italic markdown', function () {
        var wrapper = createWrapper('_italic text_');
        (0, vitest_1.expect)(wrapper.find('em').exists()).toBe(true);
        (0, vitest_1.expect)(wrapper.find('em').text()).toBe('italic text');
    });
    (0, vitest_1.it)('renders an unordered list', function () {
        var wrapper = createWrapper('- item one\n- item two');
        var items = wrapper.findAll('li');
        (0, vitest_1.expect)(items).toHaveLength(2);
        (0, vitest_1.expect)(items[0].text()).toBe('item one');
        (0, vitest_1.expect)(items[1].text()).toBe('item two');
    });
    (0, vitest_1.it)('renders a heading', function () {
        var wrapper = createWrapper('# My Heading');
        (0, vitest_1.expect)(wrapper.find('h1').exists()).toBe(true);
        (0, vitest_1.expect)(wrapper.find('h1').text()).toBe('My Heading');
    });
    (0, vitest_1.it)('sanitizes dangerous HTML to prevent XSS', function () {
        var wrapper = createWrapper('<script>alert("xss")<\/script>safe text');
        (0, vitest_1.expect)(wrapper.html()).not.toContain('<script>');
        (0, vitest_1.expect)(wrapper.html()).toContain('safe text');
    });
    (0, vitest_1.it)('renders a link', function () {
        var wrapper = createWrapper('[click here](https://example.com)');
        var anchor = wrapper.find('a');
        (0, vitest_1.expect)(anchor.exists()).toBe(true);
        (0, vitest_1.expect)(anchor.text()).toBe('click here');
        (0, vitest_1.expect)(anchor.attributes('href')).toBe('https://example.com');
    });
});
