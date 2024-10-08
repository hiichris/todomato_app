import {
  ScrollView,
  Text,
  View,
  Pressable,
  Image,
} from "react-native";

// Thumbnail Images Component
export const ThumbnailImages = ({
  images,
  styles,
  scrollViewRef,
  pickImageHandler,
  handleContentSizeChange,
}) => {

  return (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.detailsSectionTitle}>Something to visualise</Text>
      </View>

      <ScrollView horizontal={true} ref={scrollViewRef} onContentSizeChange={handleContentSizeChange} showsHorizontalScrollIndicator={false}>
        <View style={styles.imagesContainer}>
          {/* Loop through the images if there are any */}
          {images &&
            images.length > 0 &&
            images.map((image) => {
              return (
                <Image
                  key={image.image_url}
                  source={{ uri: image.image_url }}
                  style={styles.image}
                />
              );
            })}
          {/* Add a placeholder image */}
          <Pressable style={styles.placeholderImage} onPress={pickImageHandler}>
            <Text style={styles.addImageText}>Tap to Add New Image</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View style={styles.spacer}></View>
    </>
  );
};
