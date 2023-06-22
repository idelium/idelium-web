var validate = {
  validPassword(password) {
    var regex = new RegExp(
      '^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})'
    )
    return regex.test(password)
  }
}

export default validate
