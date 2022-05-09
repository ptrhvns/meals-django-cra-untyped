import Container from "./Container";

function Footer() {
  return (
    <div className="footer">
      <Container variant="viewport">
        <Container variant="content">
          <div className="footer__content-wrapper">
            &copy; {new Date().getFullYear()} Meals
          </div>
        </Container>
      </Container>
    </div>
  );
}

export default Footer;
