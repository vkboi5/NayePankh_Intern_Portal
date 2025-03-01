import React from "react";
import {
  Box,
  Typography,
  Container,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
} from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import YouTubeIcon from "@mui/icons-material/YouTube";

const theme = createTheme({
  palette: {
    primary: {
      main: "#216eb6", // Logo-matching blue
    },
    secondary: {
      main: "#42A5F5", // Lighter blue
    },
    background: {
      default: "#E3F2FD", // Very light blue background
    },
    text: {
      primary: "#263238", // Darker gray for contrast
      secondary: "#546E7A", // Softer gray
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h3: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    body1: { fontWeight: 400 },
  },
});

const chapters = [
  {
    id: 1,
    title: "Chapter 1: The Power of Crowdfunding",
    info: "Explore how crowdfunding can transform ideas into action and empower communities to create change.",
    video: {
      title: "How crowdfunding is changing the world | Simon Sinek",
      thumbnail: "https://img.youtube.com/vi/8jPQjjsBbIc/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=8jPQjjsBbIc",
    },
  },
  {
    id: 2,
    title: "Chapter 2: Building a Community for Impact",
    info: "Learn strategies to engage and grow a community that supports your mission.",
    video: {
      title: "The art of asking | Amanda Palmer",
      thumbnail: "https://img.youtube.com/vi/xMj_P_6H69g/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=xMj_P_6H69g",
    },
  },
  {
    id: 3,
    title: "Chapter 3: Storytelling for Social Good",
    info: "Understand the importance of storytelling in connecting with donors and supporters.",
    video: {
      title: "The power of vulnerability | Brené Brown",
      thumbnail: "https://img.youtube.com/vi/iCvmsMzlF7o/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=iCvmsMzlF7o",
    },
  },
  {
    id: 4,
    title: "Chapter 4: Scaling Your Vision",
    info: "Discover how to expand your crowdfunding efforts and sustain long-term impact.",
    video: {
      title: "How great leaders inspire action | Simon Sinek",
      thumbnail: "https://img.youtube.com/vi/qp0HIF3SfI4/hqdefault.jpg",
      url: "https://www.youtube.com/watch?v=qp0HIF3SfI4",
    },
  },
  {
    id: 5,
    title: "Chapter 5: Learning from Rejections",
    info: "See how rejections make a good impact that can reshape your future and your perspective.",
    video: {
      title: "The power of collective compassion | Krista Tippett",
      thumbnail: "https://img.youtube.com/vi/-vZXgApsPCQ/hqdefault.jpg",
      url: "https://youtu.be/-vZXgApsPCQ",
    },
  },
];

function LearningModules() {
  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "background.default",
          py: { xs: 4, md: 6 },
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ mb: 6 }}>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                color: "primary.main",
                fontSize: { xs: "2rem", md: "2.5rem" },
                fontWeight: 700,
                mb: 2,
                letterSpacing: "1px",
              }}
            >
              Take one step at a time
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                color: "secondary.main",
                fontSize: { xs: "1.25rem", md: "1.5rem" },
                fontWeight: 600,
                mb: 3,
              }}
            >
              Let’s Start the Journey
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: { xs: "1rem", md: "1.1rem" },
                lineHeight: 1.6,
                maxWidth: "600px",
              }}
            >
              These are some carefully curated videos to guide you on your journey with NayePankh Foundation. Dive into the world of crowdfunding, community building, and social impact. Each step you take helps us grow stronger and makes the world a better place, one community at a time.
            </Typography>
          </Box>

          <Box>
            {chapters.map((chapter) => (
              <Accordion
                key={chapter.id}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  boxShadow: "0px 2px 10px rgba(0,0,0,0.05)",
                  bgcolor: "#FFFFFF",
                  "&:before": { display: "none" },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon sx={{ color: "primary.main" }} />}
                  sx={{
                    bgcolor: "#FFFFFF",
                    borderBottom: "1px solid rgba(0,0,0,0.05)",
                    "& .MuiAccordionSummary-content": { m: 0 },
                    py: 1,
                  }}
                >
                  <Typography
                    variant="h5"
                    component="h3"
                    sx={{
                      color: "primary.main",
                      fontSize: { xs: "1.25rem", md: "1.5rem" },
                      fontWeight: 600,
                    }}
                  >
                    {chapter.title}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 3 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "text.secondary",
                      fontSize: { xs: "0.9rem", md: "1rem" },
                      lineHeight: 1.6,
                      mb: 3,
                    }}
                  >
                    {chapter.info}
                  </Typography>
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      "&:hover .youtube-icon": { opacity: 1 },
                    }}
                  >
                    <Box
                      component="img"
                      src={chapter.video.thumbnail}
                      alt={chapter.video.title}
                      sx={{
                        width: { xs: "100%", sm: "300px" },
                        height: "auto",
                        borderRadius: 2,
                        transition: "opacity 0.3s ease",
                        "&:hover": { opacity: 0.8 },
                      }}
                    />
                    <Button
                      href={chapter.video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "transparent",
                        "&:hover": { bgcolor: "transparent" },
                      }}
                    >
                      <YouTubeIcon
                        className="youtube-icon"
                        sx={{
                          fontSize: { xs: "3rem", md: "4rem" },
                          color: "#FF0000",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                        }}
                      />
                    </Button>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: "text.primary",
                      fontSize: { xs: "0.85rem", md: "0.9rem" },
                      mt: 1,
                      display: "block",
                    }}
                  >
                    {chapter.video.title}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default LearningModules;