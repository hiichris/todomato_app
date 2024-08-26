
import React, { useEffect, useRef, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View, Pressable, ActivityIndicator, Image } from "react-native";


export const ThumbnailImages = ({ images, styles, scrollViewRef }) => {
    return (
        <>
            {images && images.length > 0 && (
                <View style={styles.sectionContainer}>
                    <Text style={styles.detailsSectionTitle}>Something to visualise</Text>
                </View>
            )}

            <ScrollView horizontal={true} ref={scrollViewRef}>
                <View style={styles.imagesContainer}>
                    {/* Loop through the images if there are any */}
                    {images && images.length > 0 && (
                        images.map((image) => {
                            return (
                                <Image
                                    key={image.image_url}
                                    source={{ uri: image.image_url }}
                                    style={styles.image}
                                />
                            );
                        })
                    )}
                </View>
            </ScrollView>

            <View style={styles.spacer}></View>
        </>
    );
};