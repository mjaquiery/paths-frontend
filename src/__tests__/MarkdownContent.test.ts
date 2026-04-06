import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import MarkdownContent from '../components/MarkdownContent.vue';

function createWrapper(content: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return mount(MarkdownContent, {
    props: { content },
    global: {
      plugins: [[VueQueryPlugin, { queryClient }]],
    },
  });
}

describe('MarkdownContent', () => {
  it('renders plain text as a paragraph', () => {
    const wrapper = createWrapper('Hello world');
    expect(wrapper.find('.markdown-content').html()).toContain('Hello world');
  });

  it('renders bold markdown', () => {
    const wrapper = createWrapper('**bold text**');
    expect(wrapper.find('strong').exists()).toBe(true);
    expect(wrapper.find('strong').text()).toBe('bold text');
  });

  it('renders italic markdown', () => {
    const wrapper = createWrapper('_italic text_');
    expect(wrapper.find('em').exists()).toBe(true);
    expect(wrapper.find('em').text()).toBe('italic text');
  });

  it('renders an unordered list', () => {
    const wrapper = createWrapper('- item one\n- item two');
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0]!.text()).toBe('item one');
    expect(items[1]!.text()).toBe('item two');
  });

  it('renders a heading', () => {
    const wrapper = createWrapper('# My Heading');
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('My Heading');
  });

  it('sanitizes dangerous HTML to prevent XSS', () => {
    const wrapper = createWrapper('<script>alert("xss")<\/script>safe text');
    expect(wrapper.html()).not.toContain('<script>');
    expect(wrapper.html()).toContain('safe text');
  });

  it('renders a link', () => {
    const wrapper = createWrapper('[click here](https://example.com)');
    const anchor = wrapper.find('a');
    expect(anchor.exists()).toBe(true);
    expect(anchor.text()).toBe('click here');
    expect(anchor.attributes('href')).toBe('https://example.com');
  });
});
