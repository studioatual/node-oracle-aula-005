class HomeController {
  index(req, res) {
    return res.json({ message: 'Hello World!' });
  }
}

export default new HomeController();
