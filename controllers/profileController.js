const profile = async (req, res) => {
  res.render("profile/profile", {
    page: "Mi perfil",
    csrfToken: req.csrfToken(),
  });
};

export { profile };
