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
        },
        {
          typeName: 'waitCondition',
          type: 'options',
          options: [
            'presence',
            'visibility',
            'clickable',
            'url_contains',
            'url_to_be',
            'title_contains',
            'title_is',
            'frame',
            'staleness'
          ]
        },
        {
          typeName: 'waitSeconds',
          type: 'integer'
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
      name: 'find_element_by_xpath',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'find_elements',
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
    },
    {
      name: 'selenium_command',
      syntax: [
        {
          typeName: 'operation',
          type: 'options',
          options: [
            'navigate_to',
            'back',
            'forward',
            'refresh',
            'get_url',
            'get_title',
            'execute_script',
            'add_cookie',
            'get_cookie',
            'get_cookies',
            'delete_cookie',
            'delete_all_cookies',
            'accept_alert',
            'dismiss_alert',
            'get_alert_text',
            'switch_window',
            'new_window',
            'element_state',
            'file_upload',
            'shadow_find_element'
          ]
        },
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
          typeName: 'xpath',
          type: 'string'
        },
        {
          typeName: 'url',
          type: 'string'
        },
        {
          typeName: 'script',
          type: 'string'
        },
        {
          typeName: 'args',
          type: 'json'
        },
        {
          typeName: 'cookie',
          type: 'json'
        },
        {
          typeName: 'name',
          type: 'string'
        },
        {
          typeName: 'handle',
          type: 'string'
        },
        {
          typeName: 'windowType',
          type: 'options',
          options: ['tab', 'window']
        },
        {
          typeName: 'state',
          type: 'options',
          options: ['displayed', 'enabled', 'selected']
        },
        {
          typeName: 'path',
          type: 'string'
        },
        {
          typeName: 'shadowFindBy',
          type: 'options',
          options: ['css', 'css_selector', 'id', 'name', 'xpath']
        },
        {
          typeName: 'shadowTarget',
          type: 'string'
        }
      ]
    },
    {
      name: 'selenium_actions',
      syntax: [
        {
          typeName: 'actions',
          type: 'json'
        }
      ]
    }
  ]
}
