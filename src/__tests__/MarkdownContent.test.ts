import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import MarkdownContent from '../components/MarkdownContent.vue';

describe('MarkdownContent', () => {
  it('renders plain text as a paragraph', () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: 'Hello world' },
    });
    expect(wrapper.find('.markdown-content').html()).toContain('Hello world');
  });

  it('renders bold markdown', () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: '**bold text**' },
    });
    expect(wrapper.find('strong').exists()).toBe(true);
    expect(wrapper.find('strong').text()).toBe('bold text');
  });

  it('renders italic markdown', () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: '_italic text_' },
    });
    expect(wrapper.find('em').exists()).toBe(true);
    expect(wrapper.find('em').text()).toBe('italic text');
  });

  it('renders an unordered list', () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: '- item one\n- item two' },
    });
    const items = wrapper.findAll('li');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toBe('item one');
    expect(items[1].text()).toBe('item two');
  });

  it('renders a heading', () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: '# My Heading' },
    });
    expect(wrapper.find('h1').exists()).toBe(true);
    expect(wrapper.find('h1').text()).toBe('My Heading');
  });

  it('sanitizes dangerous HTML to prevent XSS', () => {
    const wrapper = mount(MarkdownContent, {
      props: {
        content: '<script>alert("xss")<\/script>safe text',
      },
    });
    expect(wrapper.html()).not.toContain('<script>');
    expect(wrapper.html()).toContain('safe text');
  });

  it('renders a link', () => {
    const wrapper = mount(MarkdownContent, {
      props: { content: '[click here](https://example.com)' },
    });
    const anchor = wrapper.find('a');
    expect(anchor.exists()).toBe(true);
    expect(anchor.text()).toBe('click here');
    expect(anchor.attributes('href')).toBe('https://example.com');
  });
});
