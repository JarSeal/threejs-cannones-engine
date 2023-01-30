import { Router } from 'express';

const router = Router();

router.post('/', async (request, response) => {
  const data = saveImageData(request.files, request.body);
  return response.json(data);
});

export const saveImageData = (imageFile, imageParams) => {
  console.log('imageParams', imageParams);
  console.log('imageFile', imageFile);
  return { imageUploaded: true };
};

export default router;
