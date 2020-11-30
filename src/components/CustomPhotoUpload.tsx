import { IonButton, IonIcon } from "@ionic/react";
import { pencil } from "ionicons/icons";
import React, { useRef } from "react";
import { MAX_ATTACHMENT_SIZE, PROFILE_PICTURE_FORMATS } from "../http/constants";

interface UploadProps {
  field: any,
  setPhotoPreview: (arg: any) => any,
  setFieldValue: (name: string, value: any) => any,
};

const CustomPhotoUpload: React.FC<UploadProps> = ({
  field,
  setPhotoPreview,
  setFieldValue,
}) => {
  const fileUpload = useRef<HTMLInputElement | null>(null);

  const showFileUpload = () => {
    fileUpload.current!.click();
  };
  const handleImageChange = (e: any) => {
    e.preventDefault();
    let reader = new FileReader();
    let file = e.target.files[0];

    if (!file) {
      return;
    }

    const isValid = PROFILE_PICTURE_FORMATS.includes(file.type) &&
      file.size <= MAX_ATTACHMENT_SIZE;

    if (isValid) {
      reader.onload = () => {
        setPhotoPreview(reader.result);
      };

      reader.readAsDataURL(file);
    }

    setFieldValue(field.name, file);
  };

  return (
    <>
      <input
        type="file"
        onChange={handleImageChange}
        ref={fileUpload}
        hidden
      />
      <IonButton onClick={showFileUpload} color="light" shape="round">
        <IonIcon icon={pencil} slot="icon-only" />
      </IonButton>
    </>
  );
}

export default CustomPhotoUpload;