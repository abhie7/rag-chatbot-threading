from minio import Minio
from minio.error import S3Error
import os
from dotenv import load_dotenv
load_dotenv()

class MinioHandler:
    def __init__(self,
            endpoint=os.getenv('MINIO_ENDPOINT'),
            access_key=os.getenv('MINIO_ACCESS_KEY'),
            secret_key=os.getenv('MINIO_SECRET_KEY'),
            secure=True):
        self.minio_client = Minio(endpoint, access_key, secret_key, secure=secure)

    def upload_file(self, bucket_name, object_name, local_file_path):
        try:
            result = self.minio_client.fput_object(
                bucket_name, object_name, local_file_path
            )
            etag = result.etag
            print(
                f"MinioHandler: File '{object_name}' uploaded successfully to bucket '{bucket_name}'."
            )
            return etag
        except S3Error as e:
            print("MinioHandler: Error in uploading file: e: ", e)

    def download_file(self, bucket_name, object_name, local_file_path):
        try:
            self.minio_client.fget_object(bucket_name, object_name, local_file_path)
            print(
                f"MinioHandler: File '{object_name}' downloaded successfully from bucket '{bucket_name}'."
            )
        except S3Error as e:
            print("MinioHandler: Error in downloading file: e: ", e)

if __name__ == '__main__':
    folder_name='documents'
    file = f'{folder_name}/RFP-SIA-Website-Design-Development-and-Maintenance-Services 2.pdf'
    minio_handler = MinioHandler()
    minio_handler.download_file(
        bucket_name='rfp-automation',
        object_name=file,
        local_file_path=r'/home/alois/Abhiraj/16_RFP_Chatbot/RFP-automation/rfp-chatbot/backend/app/documents'
    )