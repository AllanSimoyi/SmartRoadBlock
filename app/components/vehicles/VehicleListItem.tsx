import { Avatar, Button, Flex, HStack, Img, Text, VStack } from "@chakra-ui/react";
import type { Driver, Vehicle } from "@prisma/client";
import { Link } from "@remix-run/react";
import { Card } from "~/components/Card";
import { CardSection } from "~/components/CardSection";
import placeholderImage from "~/../public/images/light_placeholder.jpeg";
import { AdvancedImage, placeholder } from "@cloudinary/react";
import { cloudinaryImages } from "~/lib/images";
import { useCloudinary } from "../CloudinaryContextProvider";

interface CustomVehicle extends Omit<Vehicle, "finesDue"> {
  finesDue: number;
}

interface Props {
  vehicle: (CustomVehicle & { driver: Driver })
}

export function VehicleListItem (props: Props) {
  const { vehicle } = props;
  const { CLOUDINARY_CLOUD_NAME } = useCloudinary();
  return (
    <Card h="100%">
      <CardSection noBottomBorder>
        <HStack>
          <Flex flexDirection="column" justify="center" align="center">
            {Boolean(vehicle.driver.image) && (
              <AdvancedImage
                cldImg={cloudinaryImages(CLOUDINARY_CLOUD_NAME).getUploadThumbnail(vehicle.driver.image)}
                plugins={[placeholder({ mode: 'blur' })]}
              />
            )}
            {!vehicle.driver.image && (
              <Avatar name={vehicle.driver.fullName} src={vehicle.driver.image} />
            )}
          </Flex>
          <VStack align="flex-start" gap="1">
            <Text fontSize="md">
              <b>{vehicle.driver.fullName}</b>
              <br />
              {vehicle.driver.licenseNumber}
            </Text>
          </VStack>
        </HStack>
      </CardSection>
      <CardSection p={0} noBottomBorder>
        {Boolean(vehicle.image) && (
          <AdvancedImage
            cldImg={cloudinaryImages(CLOUDINARY_CLOUD_NAME).getThumbnail(vehicle.image)}
            plugins={[placeholder({ mode: 'blur' })]}
          />
        )}
        {!vehicle.image && (
          <Img boxSize='100%' src={placeholderImage} alt={vehicle.makeAndModel} />
        )}
      </CardSection>
      <CardSection flexGrow={1}>
        <Text fontSize="md">
          {`Make and Model: `}<b>{vehicle.makeAndModel}</b>
        </Text>
        <Text fontSize="md">
          {`Plate Number: `}<b>{vehicle.plateNumber}</b>
        </Text>
        <Text fontSize="md">
          {`Total Fines Due: `}<b>ZWL {Number(vehicle.finesDue || 0).toLocaleString()}</b>
        </Text>
      </CardSection>
      <CardSection noBottomBorder>
        <Link to={`/vehicles/${ vehicle.id }`}>
          <Button w="100%" colorScheme="green">MORE DETAILS</Button>
        </Link>
      </CardSection>
    </Card >
  )
}