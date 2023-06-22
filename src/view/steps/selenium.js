export default {
  stepsFile: [
    {
      name: 'open_browser',
      syntax: [
        {
          typeName: 'url',
          type: 'string'
        },
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'wait_and_click',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'wait_for_next_step',
      syntax: [
        {
          typeName: 'findBy',
          type: 'options',
          options: [
            'id',
            'xpath',
            'link_text',
            'partial_link_text',
            'name',
            'tag_name',
            'class_name',
            'css_selector',
            'css'
          ]
        },
        {
          typeName: 'target',
          type: 'string'
        }
      ]
    },
    {
      name: 'select',
      syntax: [
        {
          typeName: 'findBy',
          type: 'options',
          options: [
            'id',
            'xpath',
            'link_text',
            'partial_link_text',
            'name',
            'tag_name',
            'class_name',
            'css_selector',
            'css'
          ]
        },
        {
          typeName: 'target',
          type: 'string'
        },
        {
          typeName: 'selectType',
          type: 'options',
          options: ['label', 'value', 'index']
        },
        {
          typeName: 'value',
          type: 'string'
        }
      ]
    },
    {
      name: 'click',
      syntax: [
        {
          typeName: 'findBy',
          type: 'options',
          options: [
            'id',
            'xpath',
            'link_text',
            'partial_link_text',
            'name',
            'tag_name',
            'class_name',
            'css_selector',
            'css'
          ]
        },
        {
          typeName: 'target',
          type: 'string'
        }
      ]
    },
    {
      name: 'clear',
      syntax: [
        {
          typeName: 'findBy',
          type: 'options',
          options: [
            'id',
            'xpath',
            'link_text',
            'partial_link_text',
            'name',
            'tag_name',
            'class_name',
            'css_selector',
            'css'
          ]
        },
        {
          typeName: 'target',
          type: 'string'
        }
      ]
    },
    {
      name: 'write',
      syntax: [
        {
          typeName: 'findBy',
          type: 'options',
          options: [
            'id',
            'xpath',
            'link_text',
            'partial_link_text',
            'name',
            'tag_name',
            'class_name',
            'css_selector',
            'css'
          ]
        },
        {
          typeName: 'target',
          type: 'string'
        },
        {
          typeName: 'text',
          type: 'string'
        }
      ]
    },
    {
      name: 'wait_for_next_step_real',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'find_element_by_type',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'find_elements_by_type',
      syntax: [
        {
          typeName: 'findBy',
          type: 'options',
          options: [
            'id',
            'xpath',
            'link_text',
            'partial_link_text',
            'name',
            'tag_name',
            'class_name',
            'css_selector',
            'css'
          ]
        },
        {
          typeName: 'target',
          type: 'string'
        }
      ]
    },
    {
      name: 'page_source',
      syntax: [{}]
    },
    {
      name: 'switch_to_frame',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'switch_to_default_content',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'find_object_element',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'click_object',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'write_localstorage',
      syntax: [
        {
          typeName: 'dataLocalStorage',
          type: 'json'
        }
      ]
    },
    {
      name: 'screen_shot',
      syntax: [{}]
    },
    {
      name: 'sleep',
      syntax: [
        {
          typeName: 'seconds',
          type: 'integer'
        }
      ]
    }
  ]
}
