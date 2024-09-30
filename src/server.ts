import { app } from './app';
import AppConfig from './config/AppConfig'

const port = AppConfig?.MY_PORT || 5005
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
    console.log(`Swagger docs available at http://localhost:${port}/docs`)
  }
);