export default {
  stepsFile: [
    {
      name: 'get',
      syntax: [
        {
          typeName: 'url',
          type: 'string'
        },
        {
          typeName: 'header',
          type: 'json'
        },
        {
          typeName: 'result expected',
          type: 'json'
        }
      ]
    },
    {
      name: 'post',
      syntax: [
        {
          typeName: 'url',
          type: 'string'
        },
        {
          typeName: 'header',
          type: 'json'
        },
        {
          typeName: 'payload',
          type: 'json'
        },
        {
          typeName: 'result expected',
          type: 'json'
        }
      ]
    },
    {
      name: 'put',
      syntax: [
        {
          typeName: 'url',
          type: 'string'
        },
        {
          typeName: 'header',
          type: 'json'
        },
        {
          typeName: 'payload',
          type: 'json'
        },
        {
          typeName: 'result expected',
          type: 'json'
        }
      ]
    },
    {
      name: 'delete',
      syntax: [
        {
          typeName: 'url',
          type: 'string'
        },
        {
          typeName: 'header',
          type: 'json'
        },
        {
          typeName: 'result expected',
          type: 'json'
        }
      ]
    }
  ]
}
