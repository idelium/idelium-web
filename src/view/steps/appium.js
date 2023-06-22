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
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_desired_capabilities',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_back',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_page_source',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_page_load_timeout',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_implicitly_wait',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_script_timeout',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_orientation',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_location',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_log_types',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_log',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_update_settings',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_settings',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_start_start_activity',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_current_activity',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_current_package',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_is_app_installed',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_launch_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_background_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_close_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_reset_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_remove_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_activate_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_terminate_app',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_query_app_state',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_app_strings',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_end_test_coverage',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_clipboard',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_power_ac',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_power_capacity',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_push_file',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_pull_file',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_pull_folder',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_shake',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_lock',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_unlock',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_is_locked',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_press_keycode',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_long_press_keycode',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_hide_keyboard',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_is_keyboard_shown',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_toggle_wifi',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_toggle_location_services',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_send_sms',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_make_gsm_call',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_gsm_signal',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_gsm_voice',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_set_network_speed',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_performance_data',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_performance_data_types',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_start_recording_screen',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_stop_recording_screen',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_touch_id',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_toggle_touch_id_enrollment',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_open_notifications',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_system_bars',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_system_time',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_get_device_density',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_finger_print',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_find_element_by_accessibility_id',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    },
    {
      name: 'appium_switch_to',
      syntax: [
        {
          typeName: 'xpath',
          type: 'string'
        }
      ]
    }
  ]
}
