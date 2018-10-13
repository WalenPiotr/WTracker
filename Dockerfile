FROM denismakogon/gocv-alpine:3.4.2-buildstage as build-stage

RUN go get -u -d gocv.io/x/gocv
RUN cd $GOPATH/src/gocv.io/x/gocv && go build -o $GOPATH/bin/gocv-version ./cmd/version/main.go

COPY src $GOPATH/src/
WORKDIR $GOPATH/src/
RUN go get -d -v
RUN go build -o /dist/tracker

FROM denismakogon/gocv-alpine:3.4.2-runtime
WORKDIR /
COPY --from=build-stage /go/bin/gocv-version /gocv-version
COPY --from=build-stage /dist /dist

RUN adduser -D -g '' appuser
USER appuser

ENTRYPOINT ["./dist/tracker"]