export default {
  stepsFile: [
    {
      name: 'connect_appium',
      syntax: [
        {
          typeName: 'none',
          type: 'none'
        }
      ]
    },
    {
      name: 'appium_send_keys',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        },
        {
          typeName: 'keys',
          type: 'json'
        }
      ]
    },
    {
      name: 'appium_send_keys_xpath',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        },
        {
          typeName: 'keys',
          type: 'json'
        }
      ]
    },
    {
      name: 'appium_click',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_click_xpath',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_switch_context',
      syntax: [
        {
          typeName: 'contextName',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_execute_script',
      syntax: [
        {
          typeName: 'script',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_desired_capabilities',
      syntax: []
    },
    {
      name: 'appium_back',
      syntax: []
    },
    {
      name: 'appium_page_source',
      syntax: []
    },
    {
      name: 'appium_set_page_load_timeout',
      syntax: [
        {
          typeName: 'milliseconds',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_implicitly_wait',
      syntax: [
        {
          typeName: 'milliseconds',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_set_script_timeout',
      syntax: [
        {
          typeName: 'milliseconds',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_orientation',
      syntax: [
        {
          typeName: 'orientation',
          type: 'options',
          options: ['PORTRAIT', 'LANDSCAPE']
        }
      ]
    },
    {
      name: 'appium_location',
      syntax: [
        {
          typeName: 'latitude',
          type: 'string'
        },
        {
          typeName: 'longitude',
          type: 'string'
        },
        {
          typeName: 'altitude',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_log_types',
      syntax: []
    },
    {
      name: 'appium_get_log',
      syntax: [
        {
          typeName: 'typeString',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_update_settings',
      syntax: [
        {
          typeName: 'jsonSettings',
          type: 'json'
        }
      ]
    },
    {
      name: 'appium_get_settings',
      syntax: []
    },
    {
      name: 'appium_start_start_activity',
      syntax: [
        {
          typeName: 'jsonActivityParameters',
          type: 'json'
        }
      ]
    },
    {
      name: 'appium_current_activity',
      syntax: []
    },
    {
      name: 'appium_current_package',
      syntax: []
    },
    {
      name: 'appium_is_app_installed',
      syntax: [
        {
          typeName: 'appPackage',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_launch_app',
      syntax: []
    },
    {
      name: 'appium_background_app',
      syntax: [
        {
          typeName: 'seconds',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_close_app',
      syntax: []
    },
    {
      name: 'appium_reset_app',
      syntax: []
    },
    {
      name: 'appium_remove_app',
      syntax: [
        {
          typeName: 'appPackage',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_activate_app',
      syntax: [
        {
          typeName: 'bundleId',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_terminate_app',
      syntax: [
        {
          typeName: 'bundleId',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_query_app_state',
      syntax: [
        {
          typeName: 'bundleId',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_app_strings',
      syntax: [
        {
          typeName: 'language',
          type: 'string'
        },
        {
          typeName: 'pathFile',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_end_test_coverage',
      syntax: [
        {
          typeName: 'intent',
          type: 'string'
        },
        {
          typeName: 'path',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_clipboard',
      syntax: [
        {
          typeName: 'string',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_power_ac',
      syntax: [
        {
          typeName: 'powerOnOff',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_power_capacity',
      syntax: [
        {
          typeName: 'percent',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_push_file',
      syntax: [
        {
          typeName: 'path',
          type: 'string'
        },
        {
          typeName: 'data',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_pull_file',
      syntax: [
        {
          typeName: 'path',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_pull_folder',
      syntax: [
        {
          typeName: 'path',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_shake',
      syntax: []
    },
    {
      name: 'appium_lock',
      syntax: []
    },
    {
      name: 'appium_unlock',
      syntax: []
    },
    {
      name: 'appium_is_locked',
      syntax: []
    },
    {
      name: 'appium_press_keycode',
      syntax: [
        {
          typeName: 'keyCode',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_long_press_keycode',
      syntax: [
        {
          typeName: 'keyCode',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_hide_keyboard',
      syntax: []
    },
    {
      name: 'appium_is_keyboard_shown',
      syntax: []
    },
    {
      name: 'appium_toggle_wifi',
      syntax: []
    },
    {
      name: 'appium_toggle_location_services',
      syntax: []
    },
    {
      name: 'appium_send_sms',
      syntax: [
        {
          typeName: 'phoneNumber',
          type: 'string'
        },
        {
          typeName: 'message',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_make_gsm_call',
      syntax: [
        {
          typeName: 'phoneNumber',
          type: 'string'
        },
        {
          typeName: 'gsmAction',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_gsm_signal',
      syntax: [
        {
          typeName: 'gsmSignalStrength',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_gsm_voice',
      syntax: [
        {
          typeName: 'gsmVoiceState',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_network_speed',
      syntax: [
        {
          typeName: 'netSpeed',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_performance_data',
      syntax: [
        {
          typeName: 'packageName',
          type: 'string'
        },
        {
          typeName: 'dataType',
          type: 'string'
        },
        {
          typeName: 'dataReadTimeout',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_performance_data_types',
      syntax: []
    },
    {
      name: 'appium_start_recording_screen',
      syntax: [
        {
          typeName: 'options',
          type: 'json'
        }
      ]
    },
    {
      name: 'appium_stop_recording_screen',
      syntax: []
    },
    {
      name: 'appium_touch_id',
      syntax: [
        {
          typeName: 'touch',
          type: 'boolean'
        }
      ]
    },
    {
      name: 'appium_toggle_touch_id_enrollment',
      syntax: []
    },
    {
      name: 'appium_open_notifications',
      syntax: []
    },
    {
      name: 'appium_get_system_bars',
      syntax: []
    },
    {
      name: 'appium_get_system_time',
      syntax: [
        {
          typeName: 'date',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_device_density',
      syntax: []
    },
    {
      name: 'appium_finger_print',
      syntax: [
        {
          typeName: 'number',
          type: 'integer'
        }
      ]
    },
    {
      name: 'appium_find_element_by_accessibility_id',
      syntax: [
        {
          typeName: 'accessibilityId',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_switch_to',
      syntax: []
    },
    {
      name: 'appium_mobile_command',
      syntax: [
        {
          typeName: 'mobileCommand',
          type: 'string'
        },
        {
          typeName: 'params',
          type: 'json'
        },
        {
          typeName: 'requiredPlugin',
          type: 'string'
        }
      ]
    }
  ]
}
